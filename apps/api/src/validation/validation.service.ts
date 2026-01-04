import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawService } from '../personal-law/personal-law.service';
import { PersonalLaw } from '@prisma/client';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ValidationService {
  constructor(
    private prisma: PrismaService,
    private personalLawService: PersonalLawService,
  ) {}

  async validateWillCompletion(willId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const will = await this.prisma.will.findUnique({
      where: { id: willId },
      include: {
        profile: true,
        people: true,
        executorAssignments: true,
        witnesses: true,
        signature: true,
        scenarios: true,
        guardianAssignments: {
          include: {
            child: true,
          },
        },
      },
    });

    if (!will) {
      return {
        isValid: false,
        errors: ['Will not found'],
        warnings: [],
      };
    }

    // Required: Basic info
    if (!will.profile?.fullName || !will.profile?.dateOfBirth || !will.personalLaw) {
      errors.push('Basic information is incomplete');
    }

    // Required: Executor
    if (!will.executorAssignments || will.executorAssignments.length === 0) {
      errors.push('Executor must be assigned');
    }

    // Required: 2 witnesses
    if (!will.witnesses || will.witnesses.length < 2) {
      errors.push('At least 2 witnesses are required');
    }

    // Required: Signature
    if (!will.signature) {
      errors.push('Signature is required');
    }

    // Required: Declaration accepted
    if (!will.declarationAcceptedAt) {
      errors.push('Capacity declaration must be accepted');
    }

    // Required: At least one scenario
    if (!will.scenarios || will.scenarios.length === 0) {
      errors.push('At least one inheritance scenario must be defined');
    }

    // Check: Minors have guardians
    const minors = will.people?.filter((p) => p.isMinor) || [];
    if (minors.length > 0) {
      for (const minor of minors) {
        const hasGuardian = will.guardianAssignments?.some(
          (ga) => ga.childPersonId === minor.id,
        );
        if (!hasGuardian) {
          errors.push(`Guardian must be assigned for minor: ${minor.fullName}`);
        }
      }
    }

    // Check: Witness eligibility
    if (will.witnesses) {
      for (const witness of will.witnesses) {
        if (witness.isBeneficiaryConflict) {
          errors.push(`Witness "${witness.fullName}" cannot be a beneficiary`);
        }
        if (witness.isExecutorConflict) {
          warnings.push(`Witness "${witness.fullName}" is also the executor (not recommended)`);
        }
      }
    }

    // Check: Muslim bequest limits
    if (will.personalLaw === PersonalLaw.MUSLIM) {
      for (const scenario of will.scenarios || []) {
        const allocations = (scenario.allocationJson as any).allocations || [];
        let nonHeirTotal = 0;

        for (const allocation of allocations) {
          const person = will.people.find((p) => p.id === allocation.personId);
          if (person && !person.isHeir) {
            nonHeirTotal += allocation.percentage;
          }
        }

        if (nonHeirTotal > 33.33) {
          warnings.push(
            `Muslim bequest to non-heirs (${nonHeirTotal.toFixed(2)}%) exceeds 1/3 limit in scenario "${scenario.type}". This requires heir consent after death.`,
          );
        }
      }
    }

    // Check: Ancestral/HUF assets
    const assets = await this.prisma.asset.findMany({
      where: { willId },
    });

    for (const asset of assets) {
      if (asset.ownershipType === 'ANCESTRAL' || asset.ownershipType === 'HUF') {
        if (!asset.ownershipShare || asset.ownershipShare === 100) {
          warnings.push(
            `Asset "${asset.title}" is marked as ancestral/HUF. Ensure you only specify your share, not 100% ownership.`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateWitnessEligibility(
    willId: string,
    witnessData: { fullName: string; email?: string; phone?: string },
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const will = await this.prisma.will.findFirst({
      where: { id: willId },
      include: {
        people: true,
        executorAssignments: { include: { person: true } },
        scenarios: true,
      },
    });

    if (!will) {
      return {
        isValid: false,
        errors: ['Will not found'],
        warnings: [],
      };
    }

    // Must have email or phone
    if (!witnessData.email && !witnessData.phone) {
      errors.push('Witness must have email or phone');
    }

    // Check if witness is a beneficiary
    for (const scenario of will.scenarios || []) {
      const allocations = (scenario.allocationJson as any).allocations || [];
      for (const allocation of allocations) {
        const person = will.people.find((p) => p.id === allocation.personId);
        if (person) {
          if (
            person.email &&
            witnessData.email &&
            person.email.toLowerCase() === witnessData.email.toLowerCase()
          ) {
            errors.push('Witness cannot be a beneficiary');
          }
          if (
            person.fullName &&
            witnessData.fullName &&
            person.fullName.toLowerCase() === witnessData.fullName.toLowerCase()
          ) {
            errors.push('Witness name matches a beneficiary');
          }
        }
      }
    }

    // Check if witness is executor
    for (const executorAssignment of will.executorAssignments || []) {
      const executor = executorAssignment.person;
      if (
        executor.email &&
        witnessData.email &&
        executor.email.toLowerCase() === witnessData.email.toLowerCase()
      ) {
        warnings.push('Witness should not be the executor (not recommended)');
      }
    }

    // Check if witness is close family (recommended against)
    for (const person of will.people || []) {
      if (['SPOUSE', 'SON', 'DAUGHTER', 'MOTHER', 'FATHER'].includes(person.relationship)) {
        if (
          person.email &&
          witnessData.email &&
          person.email.toLowerCase() === witnessData.email.toLowerCase()
        ) {
          warnings.push('Witness is a close family member (not recommended)');
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async validateMuslimBequests(willId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const will = await this.prisma.will.findFirst({
      where: { id: willId },
      include: {
        people: true,
        scenarios: true,
      },
    });

    if (!will || will.personalLaw !== PersonalLaw.MUSLIM) {
      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    }

    // Compute isHeir for all people
    await this.personalLawService.computeMuslimHeirStatus(willId);

    // Refresh will data
    const updatedWill = await this.prisma.will.findFirst({
      where: { id: willId },
      include: {
        people: true,
        scenarios: true,
      },
    });

    for (const scenario of updatedWill?.scenarios || []) {
      const allocations = (scenario.allocationJson as any).allocations || [];
      let nonHeirTotal = 0;

      for (const allocation of allocations) {
        const person = updatedWill?.people.find((p) => p.id === allocation.personId);
        if (person && !person.isHeir) {
          nonHeirTotal += allocation.percentage;
        }
      }

      if (nonHeirTotal > 33.33) {
        warnings.push(
          `Muslim bequest to non-heirs (${nonHeirTotal.toFixed(2)}%) exceeds 1/3 limit in scenario "${scenario.type}". This requires heir consent after death.`,
        );
      }
    }

    return {
      isValid: true,
      errors: [],
      warnings,
    };
  }
}
