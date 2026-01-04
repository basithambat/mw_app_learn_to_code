import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawService } from '../personal-law/personal-law.service';
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
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 11;
    let yPosition = 800;

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

    // Helper function to add paragraph
    const addParagraph = (text: string, x: number, startY: number, maxWidth: number) => {
      const words = text.split(' ');
      let currentLine = '';
      let y = startY;

      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);

        if (width > maxWidth && currentLine) {
          addText(currentLine, x, y);
          y -= 15;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        addText(currentLine, x, y);
        y -= 15;
      }

      return y;
    };

    // Title
    addText('LAST WILL AND TESTAMENT', 50, yPosition, true, 16);
    yPosition -= 30;

    // Personal Declaration
    addText('PERSONAL DECLARATION', 50, yPosition, true, 14);
    yPosition -= 20;

    const profile = will.profile;
    if (profile) {
      const declaration = `I, ${profile.fullName || 'the Testator'}, being of sound mind and memory, do hereby declare this to be my Last Will and Testament, and I hereby revoke all former wills and codicils made by me.`;
      yPosition = addParagraph(declaration, 50, yPosition, 495) - 10;
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
      yPosition -= 20;
      addText('SCHEDULE OF ASSETS', 50, yPosition, true, 14);
      yPosition -= 20;

      for (const asset of will.assets) {
        const assetText = `${asset.title || 'Asset'} (${asset.category}) - ${asset.ownershipType}`;
        addText(assetText, 50, yPosition);
        yPosition -= 15;
      }
    }

    // Special handling for Muslim wills
    if (will.personalLaw === 'MUSLIM') {
      yPosition -= 20;
      addText('WASIYYAT (BEQUEST)', 50, yPosition, true, 14);
      yPosition -= 20;
      const wasiyyatText = 'This will contains bequests as per Islamic law (Wasiyyat). Bequests to non-heirs are limited to 1/3 of the estate. The remainder shall be distributed according to Islamic inheritance rules.';
      yPosition = addParagraph(wasiyyatText, 50, yPosition, 495) - 10;
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

    // Watermark
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      page.drawText('Legally created with mywasiyat', {
        x: 200,
        y: 50,
        size: 8,
        font,
        color: rgb(0.8, 0.8, 0.8),
        opacity: 0.5,
      });
    }

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
