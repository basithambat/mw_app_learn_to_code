import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLaw, OwnershipType } from '@prisma/client';
import { MuslimLawService } from './muslim-law.service';

export interface PersonalLawValidation {
  isValid: boolean;
  warnings: string[];
  disclaimers: string[];
  allowedDistribution: boolean;
  templateType: string;
}

@Injectable()
export class PersonalLawService {
  constructor(
    private prisma: PrismaService,
    private muslimLawService: MuslimLawService,
  ) { }

  async validateWill(willId: string): Promise<PersonalLawValidation> {
    const will = await this.prisma.will.findUnique({
      where: { id: willId },
      include: {
        profile: true,
        assets: true,
        people: true,
        scenarios: true,
        user: true, // Include User to check State
      },
    });

    if (!will) {
      throw new Error(`Will ${willId} not found`);
    }

    // Jurisdiction Override: Goa
    if (will.user?.state?.toUpperCase() === 'GOA') {
      return this.validateGoaWill(will);
    }

    switch (will.personalLaw) {

      case PersonalLaw.HINDU:
        return this.validateHinduWill(will);
      case PersonalLaw.MUSLIM:
        return this.validateMuslimWill(will);
      case PersonalLaw.CHRISTIAN:
        return this.validateChristianWill(will);
      default:
        return {
          isValid: true,
          warnings: [],
          disclaimers: ['Personal law not specified'],
          allowedDistribution: true,
          templateType: 'generic',
        };
    }
  }

  private validateGoaWill(will: any): PersonalLawValidation {
    // Goa Civil Code: Communion of Assets
    // Rule: Total Disposable Quota = 50%. The other 50% belongs to Spouse/Heirs (Legitime).

    // Calculate total assets value
    let totalEstateValue = 0;
    for (const asset of will.assets || []) {
      totalEstateValue += (asset.estimatedValue || 0);
    }

    const disclaimers = [
      'GOA CIVIL CODE APPLIES: Your assets are subject to "Communion of Assets".',
      'You can only dispose of 50% of your total assets (Disposable Quota).',
      'The remaining 50% is reserved for your Spouse and Forced Heirs (Legitime).'
    ];

    // Check if distribution exceeds 50%
    // Only check if we have value data, otherwise just warn
    const warnings: string[] = ['Ensure your total bequests do not exceed 50% of your net assets.'];

    // If specific allocations exist, we could check percentages, 
    // but simplified check as requested by prompt:

    return {
      isValid: true,
      warnings,
      disclaimers,
      allowedDistribution: true, // But restricted
      templateType: 'goa'
    };
  }

  private validateHinduWill(will: any): PersonalLawValidation {
    const warnings: string[] = [];

    // NEW: Strict Enforcement for Ancestral Property
    for (const asset of will.assets || []) {
      if (asset.ownershipType === 'ANCESTRAL' || asset.ownershipType === 'HUF') {

        // Calculate the maximum share the user can bequeath (Notional Partition)
        // Logic: User share = 1 / (User + Sons + Daughters + Spouse)
        // Note: This requires counting family members from 'will.people'

        const familyMembers = (will.people || []).filter((p: any) =>
          ['SON', 'DAUGHTER', 'SPOUSE'].includes(p.relationship)
        );
        const totalCoparceners = familyMembers.length + 1; // +1 for Testator
        const maxShare = 100 / totalCoparceners;

        // If user tries to give away MORE than their notional share
        if (asset.ownershipShare && asset.ownershipShare > maxShare) {
          return {
            isValid: false, // <--- BLOCK THE WILL
            warnings: [`Legal Error: You cannot bequeath ${asset.ownershipShare}% of ${asset.title}. As Ancestral Property, your legal share is only ${maxShare.toFixed(2)}% (1/${totalCoparceners}th of total).`],
            disclaimers: [],
            allowedDistribution: false,
            templateType: 'hindu'
          };
        }
      }
    }

    return {
      isValid: true,
      warnings,
      disclaimers: ['Ancestral property distribution is limited to your notional share.'],
      allowedDistribution: true,
      templateType: 'hindu',
    };
  }


  private validateMuslimWill(will: any): PersonalLawValidation {
    const warnings: string[] = [];
    const disclaimers: string[] = [];
    let isValid = true;

    // Check for ancestral assets
    for (const asset of will.assets || []) {
      if (asset.ownershipType === OwnershipType.ANCESTRAL) {
        warnings.push(
          `Asset "${asset.title}" is marked as ancestral. Under Muslim law, ancestral property follows Islamic inheritance rules (Sharia).`,
        );
      }
    }

    // Check scenarios for 1/3 limit using MuslimLawService
    const scenarios = will.scenarios || [];
    let hasNonHeirBequests = false;
    let maxBequestPercentage = 0;

    for (const scenario of scenarios) {
      const allocations = (scenario.allocationJson as any)?.allocations || [];
      let currentBequestTotal = 0;

      for (const allocation of allocations) {
        const person = (will.people || []).find((p: any) => p.id === allocation.personId);
        // Only count valid non-heirs. 
        // Note: Heirs CANNOT receive bequests without consent, 
        // so technically any allocation to an Heir in the "Wasiyat" (Will) section 
        // is invalid unless verified. But for 1/3 check, we usually sum up non-heirs.
        if (person && !person.isHeir) {
          hasNonHeirBequests = true;
          currentBequestTotal += (allocation.percentage || 0);
        }
      }
      if (currentBequestTotal > maxBequestPercentage) {
        maxBequestPercentage = currentBequestTotal;
      }
    }

    // Check limit (1/3 approx 33.33%)
    if (maxBequestPercentage > 33.34) {
      isValid = false; // Blocking validation as requested
      warnings.push(
        `⚠️ Islamic Estate Limit Exceeded: You have allocated ${maxBequestPercentage}% to non-heirs. You can only distribute up to 1/3 (33.33%) of your estate to non-heirs.`,
      );
    }

    disclaimers.push(
      'Under Muslim Personal Law (Sharia), bequests (Wasiyyat) to non-heirs are limited to 1/3 of the estate.',
    );
    disclaimers.push(
      'The remaining 2/3 (or more) is automatically distributed to your Quranic heirs (Parents, Spouse, Children) to ensure family rights are protected.',
    );

    // Check for missing Quranic heirs
    const people = will.people || [];
    const hasSpouse = people.some((p: any) => p.relationship === 'SPOUSE');
    const hasChildren = people.some((p: any) => ['SON', 'DAUGHTER'].includes(p.relationship));
    const hasParents = people.some((p: any) => ['MOTHER', 'FATHER'].includes(p.relationship));

    if (!hasSpouse && !hasChildren && !hasParents) {
      warnings.push(
        'No Quranic heirs (spouse, children, parents) found. Under Muslim law, if no Quranic heirs exist, the entire estate may go to distant relatives or the state.',
      );
    }

    // Add Faraid Explanation Note
    if (hasChildren || hasParents || hasSpouse) {
      disclaimers.push('⚖️ Faraid Distribution: Your heirs (Parents/Children/Spouse) will receive fixed shares from the remaining estate.');
    }

    return {
      isValid,
      warnings,
      disclaimers,
      allowedDistribution: isValid,
      templateType: 'muslim',
    };
  }

  private validateChristianWill(will: any): PersonalLawValidation {
    const warnings: string[] = [];
    const disclaimers: string[] = [];

    // Check for ancestral assets (similar to Hindu)
    for (const asset of will.assets || []) {
      if (asset.ownershipType === OwnershipType.ANCESTRAL) {
        warnings.push(
          `Asset "${asset.title}" is marked as ancestral. Under Indian Succession Act, 1925, you can only will your share of ancestral property, not the entire property.`,
        );

        if (!asset.ownershipShare || asset.ownershipShare === 100) {
          warnings.push(
            `Asset "${asset.title}": Specify your actual share percentage for ancestral property.`,
          );
        }
      }
      if (asset.ownershipType === OwnershipType.JOINT) {
        warnings.push(
          `Asset "${asset.title}" is jointly owned. Ensure you only distribute your share percentage.`,
        );
      }
    }

    // Self-acquired property can be freely distributed
    const selfAcquiredAssets = (will.assets || []).filter(
      (a: any) => a.ownershipType === OwnershipType.SELF_ACQUIRED,
    );
    if (selfAcquiredAssets.length > 0) {
      disclaimers.push(
        `You have ${selfAcquiredAssets.length} self-acquired asset(s). Under Indian Succession Act, 1925, these can be freely distributed according to your will.`,
      );
    }

    disclaimers.push(
      'This will is governed by Indian Succession Act, 1925. You have the right to freely distribute self-acquired property. Ancestral property can only be willed as your share.',
    );

    return {
      isValid: true,
      warnings,
      disclaimers,
      allowedDistribution: true,
      templateType: 'christian',
    };
  }

  async computeMuslimHeirStatus(willId: string): Promise<void> {
    // Auto-compute isHeir for all people in a Muslim will
    const will = await this.prisma.will.findUnique({
      where: { id: willId },
      include: { people: true },
    });

    if (!will || will.personalLaw !== PersonalLaw.MUSLIM) {
      return;
    }

    // Update each person's isHeir status
    for (const person of will.people) {
      const isHeir = this.isMuslimHeir(person.relationship);
      if (person.isHeir !== isHeir) {
        await this.prisma.willPerson.update({
          where: { id: person.id },
          data: { isHeir },
        });
      }
    }
  }

  private isMuslimHeir(relationship: string): boolean {
    // Quranic heirs (primary): spouse, children, parents
    // Secondary heirs: siblings, grandparents, etc.
    const primaryHeirRelationships = [
      'SPOUSE',
      'SON',
      'DAUGHTER',
      'MOTHER',
      'FATHER',
    ];

    const secondaryHeirRelationships = [
      'BROTHER',
      'SISTER',
      'GRANDFATHER',
      'GRANDMOTHER',
    ];

    return primaryHeirRelationships.includes(relationship) ||
      secondaryHeirRelationships.includes(relationship);
  }

  /**
   * Compute default Islamic inheritance shares for Quranic heirs
   * This is a simplified version - full Sharia calculation is complex
   */
  computeMuslimInheritanceShares(people: any[]): Map<string, number> {
    const shares = new Map<string, number>();

    // 1. Identify Heirs
    const spouse = people.find(p => p.relationship === 'SPOUSE');
    const father = people.find(p => p.relationship === 'FATHER');
    const mother = people.find(p => p.relationship === 'MOTHER');
    const sons = people.filter(p => p.relationship === 'SON');
    const daughters = people.filter(p => p.relationship === 'DAUGHTER');

    let remainingEstate = 100.0;
    const hasChildren = sons.length > 0 || daughters.length > 0;

    // 2. Fixed Shares (Ashab-al-Furud)

    // Spouse
    if (spouse) {
      const spouseShare = hasChildren ? 12.5 : 25.0; // 1/8 or 1/4
      shares.set(spouse.id, spouseShare);
      remainingEstate -= spouseShare;
    }

    // Parents
    if (father) {
      const fatherShare = hasChildren ? 16.66 : 0; // 1/6 (Simplified: Father is residuary if no kids)
      if (fatherShare > 0) {
        shares.set(father.id, fatherShare);
        remainingEstate -= fatherShare;
      }
    }
    if (mother) {
      const motherShare = hasChildren ? 16.66 : 33.33; // 1/6 or 1/3
      shares.set(mother.id, motherShare);
      remainingEstate -= motherShare;
    }

    // 3. Residuary Shares (Asaba) - The 2:1 Rule
    // "Allah instructs you concerning your children: for the male, what is equal to the share of two females." (4:11)

    if (hasChildren) {
      const numSons = sons.length;
      const numDaughters = daughters.length;

      // Calculate Units: Son = 2 units, Daughter = 1 unit
      const totalUnits = (numSons * 2) + (numDaughters * 1);
      const valuePerUnit = remainingEstate / totalUnits;

      sons.forEach(son => {
        shares.set(son.id, valuePerUnit * 2);
      });

      daughters.forEach(daughter => {
        shares.set(daughter.id, valuePerUnit * 1);
      });
    } else {
      // If no children, Father often takes the residue. (Simplified logic for MVP)
      if (father) {
        const currentShare = shares.get(father.id) || 0;
        shares.set(father.id, currentShare + remainingEstate);
      }
    }

    return shares;
  }

  getTemplateType(personalLaw: PersonalLaw): string {
    switch (personalLaw) {
      case PersonalLaw.HINDU:
        return 'hindu';
      case PersonalLaw.MUSLIM:
        return 'muslim';
      case PersonalLaw.CHRISTIAN:
        return 'christian';
      default:
        return 'generic';
    }
  }

  shouldShowAncestralWarning(ownershipType: OwnershipType): boolean {
    return (
      ownershipType === OwnershipType.ANCESTRAL ||
      ownershipType === OwnershipType.HUF ||
      ownershipType === OwnershipType.JOINT
    );
  }

  getWillTemplate(personalLaw: PersonalLaw): { type: string; content: string } {
    const templateType = this.getTemplateType(personalLaw);

    switch (personalLaw) {
      case PersonalLaw.HINDU:
        return {
          type: 'hindu',
          content: 'This will is governed by Hindu Succession Act, 1956. Self-acquired property can be freely distributed. Ancestral and HUF property can only be willed as the testator\'s share.',
        };
      case PersonalLaw.MUSLIM:
        return {
          type: 'muslim',
          content: 'This will contains bequests (Wasiyyat) as per Islamic law. Bequests to non-heirs are limited to 1/3 of the estate. The remainder shall be distributed according to Islamic inheritance rules (Sharia).',
        };
      case PersonalLaw.CHRISTIAN:
        return {
          type: 'christian',
          content: 'This will is governed by Indian Succession Act, 1925. The testator has the right to freely distribute self-acquired property. Ancestral property can only be willed as the testator\'s share.',
        };
      default:
        return {
          type: 'generic',
          content: 'This will is governed by the applicable personal law and Indian Succession Act, 1925.',
        };
    }
  }
}
