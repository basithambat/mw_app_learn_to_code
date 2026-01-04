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

    // Check assets for ancestral/HUF property
    for (const asset of will.assets || []) {
      if (asset.ownershipType === OwnershipType.ANCESTRAL) {
        hasAncestralAssets = true;
        warnings.push(
          `Asset "${asset.title}" is marked as ancestral. You can only will your share, not the entire property.`,
        );
      }
      if (asset.ownershipType === OwnershipType.HUF) {
        hasHUFAssets = true;
        warnings.push(
          `Asset "${asset.title}" is marked as HUF/coparcenary property. Special rules apply.`,
        );
      }
      if (asset.ownershipType === OwnershipType.JOINT) {
        warnings.push(
          `Asset "${asset.title}" is jointly owned. Ensure you only distribute your share.`,
        );
      }
    }

    if (hasAncestralAssets || hasHUFAssets) {
      disclaimers.push(
        'Ancestral and HUF property have special inheritance rules. You can only will your share, not the entire property.',
      );
      disclaimers.push(
        'It is recommended to consult a legal expert for ancestral/HUF property distribution.',
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
          `Asset "${asset.title}" is marked as ancestral. Muslim inheritance rules apply.`,
        );
      }
    }

    disclaimers.push(
      'Under Muslim law, bequests to non-heirs are limited to 1/3 of the estate unless heirs consent after death.',
    );
    disclaimers.push(
      'The remainder of the estate will be distributed according to Islamic inheritance rules.',
    );

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
          `Asset "${asset.title}" is marked as ancestral. You can only will your share.`,
        );
      }
      if (asset.ownershipType === OwnershipType.JOINT) {
        warnings.push(
          `Asset "${asset.title}" is jointly owned. Ensure you only distribute your share.`,
        );
      }
    }

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
    // Quranic heirs: spouse, children, parents, siblings
    const heirRelationships = [
      'SPOUSE',
      'SON',
      'DAUGHTER',
      'MOTHER',
      'FATHER',
      'BROTHER',
      'SISTER',
    ];
    return heirRelationships.includes(relationship);
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
}
