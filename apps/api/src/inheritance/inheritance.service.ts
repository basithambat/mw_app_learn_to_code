import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScenarioDto } from './dto/scenario.dto';
import { ScenarioType, PersonalLaw } from '@prisma/client';

interface Allocation {
  personId: string;
  percentage: number;
  description?: string;
}

interface ScenarioAllocation {
  allocations: Allocation[];
  meta?: Record<string, any>;
}

@Injectable()
export class InheritanceService {
  constructor(private prisma: PrismaService) {}

  async create(willId: string, userId: string, createScenarioDto: CreateScenarioDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
      include: {
        people: true,
        profile: true,
      },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Validate allocation structure
    const allocationData = createScenarioDto.allocationJson as ScenarioAllocation;
    this.validateAllocations(allocationData, will.people.map((p) => p.id));

    // For Muslim wills, validate bequest limits
    const warnings: string[] = [];
    if (will.personalLaw === PersonalLaw.MUSLIM) {
      const muslimWarnings = this.validateMuslimBequests(
        allocationData,
        will.people,
        createScenarioDto.type,
      );
      warnings.push(...muslimWarnings);
    }

    // Convert to plain object for Prisma JSON field
    const allocationJson = JSON.parse(JSON.stringify(allocationData));

    // Upsert scenario (unique per willId + type)
    const scenario = await this.prisma.inheritanceScenario.upsert({
      where: {
        willId_type: {
          willId,
          type: createScenarioDto.type,
        },
      },
      create: {
        willId,
        type: createScenarioDto.type,
        title: createScenarioDto.title,
        notes: createScenarioDto.notes,
        allocationJson: allocationJson,
      },
      update: {
        title: createScenarioDto.title,
        notes: createScenarioDto.notes,
        allocationJson: allocationJson,
      },
    });

    return {
      scenario,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async findAll(willId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    return this.prisma.inheritanceScenario.findMany({
      where: { willId },
      orderBy: { createdAt: 'asc' },
    });
  }

  private validateAllocations(allocationData: ScenarioAllocation, validPersonIds: string[]) {
    if (!allocationData.allocations || !Array.isArray(allocationData.allocations)) {
      throw new BadRequestException('Allocations must be an array');
    }

    if (allocationData.allocations.length === 0) {
      throw new BadRequestException('At least one allocation is required');
    }

    // Validate each allocation
    let totalPercentage = 0;
    for (const allocation of allocationData.allocations) {
      if (!allocation.personId) {
        throw new BadRequestException('Each allocation must have a personId');
      }

      if (!validPersonIds.includes(allocation.personId)) {
        throw new BadRequestException(
          `Person with ID ${allocation.personId} does not exist in this will`,
        );
      }

      if (typeof allocation.percentage !== 'number' || allocation.percentage < 0) {
        throw new BadRequestException('Percentage must be a positive number');
      }

      if (allocation.percentage > 100) {
        throw new BadRequestException('Percentage cannot exceed 100');
      }

      totalPercentage += allocation.percentage;
    }

    // Total must be 100%
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(
        `Total allocation must equal 100%. Current total: ${totalPercentage}%`,
      );
    }
  }

  private validateMuslimBequests(
    allocationData: ScenarioAllocation,
    people: any[],
    scenarioType: ScenarioType,
  ): string[] {
    const warnings: string[] = [];

    // Compute isHeir for all people if not already set
    const peopleWithHeirStatus = people.map((person) => {
      if (person.isHeir === null || person.isHeir === undefined) {
        // Auto-compute based on relationship
        const isHeir = this.computeMuslimHeirStatus(person.relationship);
        return { ...person, isHeir };
      }
      return person;
    });

    // Calculate total percentage for non-heirs
    let nonHeirTotal = 0;
    for (const allocation of allocationData.allocations) {
      const person = peopleWithHeirStatus.find((p) => p.id === allocation.personId);
      if (person && !person.isHeir) {
        nonHeirTotal += allocation.percentage;
      }
    }

    // Check if non-heir total exceeds 1/3 (33.33%)
    if (nonHeirTotal > 33.33) {
      warnings.push(
        `Muslim bequest to non-heirs (${nonHeirTotal.toFixed(2)}%) exceeds the 1/3 limit (33.33%). This requires consent from heirs after death.`,
      );
    }

    return warnings;
  }

  private computeMuslimHeirStatus(relationship: string): boolean {
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
}
