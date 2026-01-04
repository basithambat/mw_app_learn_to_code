import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawService } from '../personal-law/personal-law.service';
import { PersonalLaw } from '@prisma/client';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

@Injectable()
export class PdfService {
  constructor(
    private prisma: PrismaService,
    private personalLawService: PersonalLawService,
  ) {}

  async generatePdf(willId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
      include: {
        profile: true,
        people: true,
        scenarios: true,
        guardianAssignments: {
          include: {
            child: true,
            guardian: true,
            alternateGuardian: true,
          },
        },
        executorAssignments: {
          include: { person: true },
        },
        witnesses: true,
        signature: true,
        consentVideo: true,
        assets: true,
      },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Validate required components
    if (!will.executorAssignments || will.executorAssignments.length === 0) {
      throw new BadRequestException('Executor must be assigned before generating PDF');
    }

    if (!will.witnesses || will.witnesses.length < 2) {
      throw new BadRequestException('At least 2 witnesses are required before generating PDF');
    }

    if (!will.signature) {
      throw new BadRequestException('Signature is required before generating PDF');
    }

    if (!will.declarationAcceptedAt) {
      throw new BadRequestException('Capacity declaration must be accepted before generating PDF');
    }

    // Get next version number
    const existingVersions = await this.prisma.willPdfVersion.findMany({
      where: { willId },
      orderBy: { versionNumber: 'desc' },
      take: 1,
    });

    const versionNumber = existingVersions[0] ? existingVersions[0].versionNumber + 1 : 1;

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 11;
    const lineHeight = 15;
    const margin = 50;
    const maxWidth = 495;
    let yPosition = 800;
    const bottomMargin = 80; // Space for footer/watermark

    // Helper function to add text
    const addText = (text: string, x: number, y: number, isBold = false, size = fontSize) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: isBold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
    };

    // Helper function to check if new page is needed
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition - requiredSpace < bottomMargin) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 800;
        return true;
      }
      return false;
    };

    // Helper function to add paragraph with automatic page breaks
    const addParagraph = (text: string, x: number, startY: number, maxWidth: number) => {
      const words = text.split(' ');
      let currentLine = '';
      let y = startY;

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth && currentLine) {
          // Check if we need a new page
          if (y - lineHeight < bottomMargin) {
            page = pdfDoc.addPage([595, 842]);
            y = 800;
          }
          addText(currentLine, x, y);
          y -= lineHeight;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        if (y - lineHeight < bottomMargin) {
          page = pdfDoc.addPage([595, 842]);
          y = 800;
        }
        addText(currentLine, x, y);
        y -= lineHeight;
      }

      return y;
    };

    // Title
    addText('LAST WILL AND TESTAMENT', margin, yPosition, true, 18);
    yPosition -= 25;
    
    // Subtitle with personal law
    const personalLawLabel = this.personalLawService.getTemplateType(will.personalLaw).toUpperCase();
    addText(`(Governed by ${personalLawLabel} Personal Law)`, margin, yPosition, false, 10);
    yPosition -= 30;

    // Personal Declaration
    checkNewPage(60);
    addText('PERSONAL DECLARATION', margin, yPosition, true, 14);
    yPosition -= 20;

    const profile = will.profile;
    if (profile) {
      const fullName = profile.fullName || 'the Testator';
      const dob = profile.dateOfBirth 
        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })
        : '';
      
      const declaration = `I, ${fullName}${dob ? `, born on ${dob}` : ''}, being of sound mind and memory, and not acting under any coercion, undue influence, or fraud, do hereby declare this to be my Last Will and Testament, and I hereby revoke all former wills, codicils, and testamentary dispositions made by me.`;
      yPosition = addParagraph(declaration, margin, yPosition, maxWidth) - 10;
    }

    // Revocation Clause
    if (will.previousWillExists) {
      yPosition -= 20;
      addText('REVOCATION CLAUSE', 50, yPosition, true, 14);
      yPosition -= 20;
      const revocation = 'I hereby revoke all former wills, codicils, and testamentary dispositions made by me.';
      yPosition = addParagraph(revocation, 50, yPosition, 495) - 10;
    }

    // Executor Appointment
    yPosition -= 20;
    addText('APPOINTMENT OF EXECUTOR', 50, yPosition, true, 14);
    yPosition -= 20;

    const executor = will.executorAssignments[0]?.person;
    if (executor) {
      const executorText = `I hereby appoint ${executor.fullName} as the executor of this will. The executor shall have full power and authority to administer my estate according to the terms of this will.`;
      yPosition = addParagraph(executorText, 50, yPosition, 495) - 10;
    }

    // Distribution Clauses (Scenario-based)
    yPosition -= 20;
    addText('DISTRIBUTION OF ESTATE', 50, yPosition, true, 14);
    yPosition -= 20;

    for (const scenario of will.scenarios) {
      const scenarioTitle = this.getScenarioTitle(scenario.type);
      addText(scenarioTitle, 50, yPosition, true, 12);
      yPosition -= 15;

      const allocations = (scenario.allocationJson as any).allocations || [];
      for (const allocation of allocations) {
        const person = will.people.find((p) => p.id === allocation.personId);
        if (person) {
          const allocationText = `${person.fullName}: ${allocation.percentage}%`;
          addText(allocationText, 70, yPosition);
          yPosition -= 15;
        }
      }
      yPosition -= 10;
    }

    // Guardianship (if minors exist)
    if (will.guardianAssignments && will.guardianAssignments.length > 0) {
      yPosition -= 20;
      addText('GUARDIANSHIP', 50, yPosition, true, 14);
      yPosition -= 20;

      for (const assignment of will.guardianAssignments) {
        const guardianText = `I hereby appoint ${assignment.guardian.fullName} as guardian for ${assignment.child.fullName}${assignment.alternateGuardian ? `, with ${assignment.alternateGuardian.fullName} as alternate guardian` : ''}.`;
        yPosition = addParagraph(guardianText, 50, yPosition, 495) - 10;
      }
    }

    // Schedule of Assets
    if (will.assets && will.assets.length > 0) {
      checkNewPage(60);
      yPosition -= 20;
      addText('SCHEDULE OF ASSETS', margin, yPosition, true, 14);
      yPosition -= 20;

      for (const asset of will.assets) {
        if (yPosition - lineHeight * 3 < bottomMargin) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = 800;
        }
        
        const assetTitle = asset.title || 'Unnamed Asset';
        const category = asset.category || 'OTHER';
        const ownershipType = asset.ownershipType || 'SELF_ACQUIRED';
        const ownershipShare = asset.ownershipShare ? ` (${asset.ownershipShare}% share)` : '';
        
        addText(`${assetTitle}`, margin, yPosition, true, 12);
        yPosition -= lineHeight;
        addText(`Category: ${category} | Ownership: ${ownershipType}${ownershipShare}`, margin + 10, yPosition, false, 10);
        yPosition -= lineHeight;
        
        if (asset.description) {
          yPosition = addParagraph(asset.description, margin + 10, yPosition, maxWidth - 10) - 5;
        }
        
        yPosition -= 10;
      }
    }

    // Personal Law Specific Sections
    checkNewPage(80);
    yPosition -= 20;
    
    if (will.personalLaw === PersonalLaw.MUSLIM) {
      addText('WASIYYAT (BEQUEST) - ISLAMIC LAW', margin, yPosition, true, 14);
      yPosition -= 20;
      const wasiyyatText = 'This will contains bequests (Wasiyyat) as per Islamic Personal Law (Sharia). Under Muslim law, bequests to non-heirs are limited to 1/3 of the estate. The remaining 2/3 of the estate must be distributed to Quranic heirs (spouse, children, parents, siblings) according to Islamic inheritance rules. If bequests to non-heirs exceed 1/3, the excess requires consent from all heirs after the testator\'s death, or it may be invalid.';
      yPosition = addParagraph(wasiyyatText, margin, yPosition, maxWidth) - 10;
    } else if (will.personalLaw === PersonalLaw.HINDU) {
      addText('GOVERNING LAW - HINDU SUCCESSION ACT, 1956', margin, yPosition, true, 14);
      yPosition -= 20;
      
      // Check for ancestral/HUF assets
      const hasAncestralAssets = will.assets?.some((a: any) => 
        a.ownershipType === 'ANCESTRAL' || a.ownershipType === 'HUF'
      );
      
      if (hasAncestralAssets) {
        const hinduDisclaimer = 'IMPORTANT: This will contains ancestral or HUF (Hindu Undivided Family) property. Under Hindu Succession Act, 1956, you can only will your coparcenary share of such property, not the entire property. Other coparceners have rights to their shares. Self-acquired property can be freely distributed.';
        yPosition = addParagraph(hinduDisclaimer, margin, yPosition, maxWidth) - 10;
      } else {
        const hinduText = 'This will is governed by Hindu Succession Act, 1956. Self-acquired property can be freely distributed according to the terms of this will.';
        yPosition = addParagraph(hinduText, margin, yPosition, maxWidth) - 10;
      }
    } else if (will.personalLaw === PersonalLaw.CHRISTIAN) {
      addText('GOVERNING LAW - INDIAN SUCCESSION ACT, 1925', margin, yPosition, true, 14);
      yPosition -= 20;
      const christianText = 'This will is governed by Indian Succession Act, 1925. The testator has the right to freely distribute self-acquired property. Ancestral property can only be willed as the testator\'s share.';
      yPosition = addParagraph(christianText, margin, yPosition, maxWidth) - 10;
    }

    // Witness Declaration
    yPosition -= 30;
    addText('WITNESS DECLARATION', 50, yPosition, true, 14);
    yPosition -= 20;

    const witnessText = `We, the undersigned witnesses, hereby declare that the testator signed this will in our presence, and we signed in the presence of the testator and each other.`;
    yPosition = addParagraph(witnessText, 50, yPosition, 495) - 20;

    for (const witness of will.witnesses) {
      addText(`Witness: ${witness.fullName}`, 50, yPosition);
      if (witness.addressLine) {
        yPosition -= 15;
        addText(`Address: ${witness.addressLine}`, 50, yPosition);
      }
      yPosition -= 20;
    }

    // Signature Block
    yPosition -= 20;
    addText('SIGNATURE OF TESTATOR', 50, yPosition, true, 12);
    yPosition -= 30;
    addText('_________________________', 50, yPosition);
    yPosition -= 15;
    if (profile) {
      addText(profile.fullName || 'Testator', 50, yPosition);
    }
    yPosition -= 20;
    addText(`Date: ${new Date().toLocaleDateString()}`, 50, yPosition);

    // Add footer with watermark and page numbers
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      // Watermark
      page.drawText('Legally created with mywasiyat', {
        x: 200,
        y: 50,
        size: 8,
        font,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.5,
      });
      
      // Page number
      page.drawText(`Page ${index + 1} of ${pages.length}`, {
        x: 500,
        y: 30,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Generated date
      page.drawText(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, {
        x: margin,
        y: 30,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const hash = createHash('sha256').update(pdfBytes).digest('hex');

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'wills', willId);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `will_v${versionNumber}_${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, pdfBytes);

    const fileUrl = `/uploads/wills/${willId}/${filename}`;

    // Create PDF version record
    const pdfVersion = await this.prisma.willPdfVersion.create({
      data: {
        willId,
        versionNumber,
        fileUrl,
        fileHash: hash,
        generatedAt: new Date(),
      },
    });

    return {
      pdfVersion,
      fileUrl,
      message: 'PDF generated successfully',
    };
  }

  async getLatestPdf(willId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const latestPdf = await this.prisma.willPdfVersion.findFirst({
      where: { willId },
      orderBy: { versionNumber: 'desc' },
    });

    if (!latestPdf) {
      throw new NotFoundException('No PDF found for this will');
    }

    return latestPdf;
  }

  private getScenarioTitle(type: string): string {
    switch (type) {
      case 'USER_DIES_FIRST':
        return 'If I die before my spouse:';
      case 'SPOUSE_DIES_FIRST':
        return 'If my spouse dies before me:';
      case 'NO_ONE_SURVIVES':
        return 'If no one from my family survives:';
      default:
        return 'Distribution:';
    }
  }
}
