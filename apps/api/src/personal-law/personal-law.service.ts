import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLaw, OwnershipType } from '@prisma/client';

export interface PersonalLawValidation {
  isValid: boolean;
  warnings: string[];
  disclaimers: string[];
  allowedDistribution: boolean;
  templateType: string;
}

@Injectable()
export class PersonalLawService {
  constructor(private prisma: PrismaService) {}

  async validateWill(willId: string): Promise<PersonalLawValidation> {
    const will = await this.prisma.will.findUnique({
      where: { id: willId },
      include: {
        profile: true,
        assets: true,
        people: true,
      },
    });

    if (!will) {
      throw new Error(`Will ${willId} not found`);
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

  private validateHinduWill(will: any): PersonalLawValidation {
    const warnings: string[] = [];
    const disclaimers: string[] = [];
    let hasAncestralAssets = false;
    let hasHUFAssets = false;
    let hasJointAssets = false;

    // Check assets for ancestral/HUF property
    for (const asset of will.assets || []) {
      if (asset.ownershipType === OwnershipType.ANCESTRAL) {
        hasAncestralAssets = true;
        warnings.push(
          `Asset "${asset.title}" is marked as ancestral. Under Hindu Succession Act, you can only will your share (not exceeding your coparcenary interest), not the entire property.`,
        );
        
        // Check if ownership share is specified correctly
        if (!asset.ownershipShare || asset.ownershipShare === 100) {
          warnings.push(
            `Asset "${asset.title}": For ancestral property, specify your actual share percentage (typically less than 100%).`,
          );
        }
      }
      if (asset.ownershipType === OwnershipType.HUF) {
        hasHUFAssets = true;
        warnings.push(
          `Asset "${asset.title}" is marked as HUF/coparcenary property. You can only will your coparcenary share, not the entire HUF property.`,
        );
      }
      if (asset.ownershipType === OwnershipType.JOINT) {
        hasJointAssets = true;
        if (!asset.ownershipShare || asset.ownershipShare === 100) {
          warnings.push(
            `Asset "${asset.title}" is jointly owned. Specify your exact share percentage.`,
          );
        }
      }
    }

    // Check for self-acquired property (can be freely distributed)
    const selfAcquiredAssets = (will.assets || []).filter(
      (a: any) => a.ownershipType === OwnershipType.SELF_ACQUIRED,
    );
    if (selfAcquiredAssets.length > 0) {
      disclaimers.push(
        `You have ${selfAcquiredAssets.length} self-acquired asset(s). These can be freely distributed according to your will.`,
      );
    }

    if (hasAncestralAssets || hasHUFAssets) {
      disclaimers.push(
        'Ancestral and HUF property are governed by Hindu Succession Act, 1956. You can only will your coparcenary share, not the entire property. Other coparceners have rights to their shares.',
      );
      disclaimers.push(
        'It is strongly recommended to consult a legal expert for ancestral/HUF property distribution to avoid future disputes.',
      );
    }

    if (hasJointAssets) {
      disclaimers.push(
        'Joint property can only be willed as your share. Ensure you specify the correct ownership percentage.',
      );
    }

    return {
      isValid: true,
      warnings,
      disclaimers,
      allowedDistribution: true,
      templateType: 'hindu',
    };
  }

  private validateMuslimWill(will: any): PersonalLawValidation {
    const warnings: string[] = [];
    const disclaimers: string[] = [];

    // Check for ancestral assets
    for (const asset of will.assets || []) {
      if (asset.ownershipType === OwnershipType.ANCESTRAL) {
        warnings.push(
          `Asset "${asset.title}" is marked as ancestral. Under Muslim law, ancestral property follows Islamic inheritance rules (Sharia).`,
        );
      }
    }

    // Check scenarios for 1/3 limit
    const scenarios = will.scenarios || [];
    let hasNonHeirBequests = false;
    
    for (const scenario of scenarios) {
      const allocations = (scenario.allocationJson as any)?.allocations || [];
      for (const allocation of allocations) {
        const person = (will.people || []).find((p: any) => p.id === allocation.personId);
        if (person && !person.isHeir) {
          hasNonHeirBequests = true;
          break;
        }
      }
    }

    disclaimers.push(
      'Under Muslim Personal Law (Sharia), bequests (Wasiyyat) to non-heirs are limited to 1/3 of the estate. The remaining 2/3 must go to Quranic heirs (spouse, children, parents, siblings).',
    );
    
    if (hasNonHeirBequests) {
      disclaimers.push(
        'If bequests to non-heirs exceed 1/3, the excess requires consent from all heirs after your death, or it may be invalid.',
      );
    }
    
    disclaimers.push(
      'The remainder of the estate (after bequests) will be distributed according to Islamic inheritance rules (Quranic shares).',
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

    return {
      isValid: true,
      warnings,
      disclaimers,
      allowedDistribution: true,
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
    
    // Find Quranic heirs
    const spouse = people.find((p) => p.relationship === 'SPOUSE');
    const sons = people.filter((p) => p.relationship === 'SON');
    const daughters = people.filter((p) => p.relationship === 'DAUGHTER');
    const father = people.find((p) => p.relationship === 'FATHER');
    const mother = people.find((p) => p.relationship === 'MOTHER');

    // Simplified Sharia rules (full calculation is more complex)
    if (spouse && (sons.length > 0 || daughters.length > 0)) {
      // Spouse gets 1/4 if there are children
      shares.set(spouse.id, 25);
    } else if (spouse && !sons.length && !daughters.length) {
      // Spouse gets 1/2 if no children
      shares.set(spouse.id, 50);
    }

    if (father) {
      shares.set(father.id, 16.67); // 1/6
    }
    if (mother) {
      shares.set(mother.id, 16.67); // 1/6
    }

    // Remaining goes to children (sons get 2x daughters)
    // This is simplified - actual Sharia is more complex

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
