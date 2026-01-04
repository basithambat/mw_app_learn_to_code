import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto, UpdatePersonDto } from './dto/person.dto';
import { CreateGuardianDto } from './dto/guardian.dto';
import { RelationshipType, StepStatus } from '@prisma/client';

@Injectable()
export class PeopleService {
  constructor(private prisma: PrismaService) {}

  async create(willId: string, userId: string, createPersonDto: CreatePersonDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Validate relationship constraints
    await this.validateRelationship(willId, createPersonDto.relationship);

    // Calculate isMinor based on dateOfBirth
    let isMinor = false;
    if (createPersonDto.dateOfBirth) {
      const dob = new Date(createPersonDto.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        isMinor = age - 1 < 18;
      } else {
        isMinor = age < 18;
      }
    }

    const person = await this.prisma.willPerson.create({
      data: {
        willId,
        fullName: createPersonDto.fullName,
        relationship: createPersonDto.relationship,
        gender: createPersonDto.gender,
        dateOfBirth: createPersonDto.dateOfBirth ? new Date(createPersonDto.dateOfBirth) : null,
        isMinor,
        email: createPersonDto.email,
        phone: createPersonDto.phone,
        isHeir: createPersonDto.isHeir,
        isBeneficiary: createPersonDto.isBeneficiary || false,
      },
    });

    // Update step status
    await this.updateStepStatus(willId);

    return person;
  }

  async findAll(willId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    return this.prisma.willPerson.findMany({
      where: { willId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(willId: string, personId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const person = await this.prisma.willPerson.findFirst({
      where: {
        id: personId,
        willId,
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${personId} not found`);
    }

    return person;
  }

  async update(
    willId: string,
    personId: string,
    userId: string,
    updatePersonDto: UpdatePersonDto,
  ) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Verify person exists and belongs to will
    const existingPerson = await this.prisma.willPerson.findFirst({
      where: { id: personId, willId },
    });

    if (!existingPerson) {
      throw new NotFoundException(`Person with ID ${personId} not found`);
    }

    // If relationship is being changed, validate
    if (updatePersonDto.relationship && updatePersonDto.relationship !== existingPerson.relationship) {
      await this.validateRelationship(willId, updatePersonDto.relationship, personId);
    }

    // Recalculate isMinor if dateOfBirth is updated
    let isMinor = existingPerson.isMinor;
    if (updatePersonDto.dateOfBirth) {
      const dob = new Date(updatePersonDto.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        isMinor = age - 1 < 18;
      } else {
        isMinor = age < 18;
      }
    }

    const person = await this.prisma.willPerson.update({
      where: { id: personId },
      data: {
        fullName: updatePersonDto.fullName,
        relationship: updatePersonDto.relationship,
        gender: updatePersonDto.gender,
        dateOfBirth: updatePersonDto.dateOfBirth ? new Date(updatePersonDto.dateOfBirth) : undefined,
        isMinor,
        email: updatePersonDto.email,
        phone: updatePersonDto.phone,
        isHeir: updatePersonDto.isHeir,
        isBeneficiary: updatePersonDto.isBeneficiary,
      },
    });

    // Update step status
    await this.updateStepStatus(willId);

    return person;
  }

  async remove(willId: string, personId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Verify person exists and belongs to will
    const person = await this.prisma.willPerson.findFirst({
      where: { id: personId, willId },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${personId} not found`);
    }

    await this.prisma.willPerson.delete({
      where: { id: personId },
    });

    // Update step status
    await this.updateStepStatus(willId);

    return { message: 'Person deleted successfully' };
  }

  private async validateRelationship(willId: string, relationship: RelationshipType, excludePersonId?: string) {
    // Only one spouse allowed
    if (relationship === RelationshipType.SPOUSE) {
      const existingSpouse = await this.prisma.willPerson.findFirst({
        where: {
          willId,
          relationship: RelationshipType.SPOUSE,
          ...(excludePersonId && { id: { not: excludePersonId } }),
        },
      });

      if (existingSpouse) {
        throw new BadRequestException('Only one spouse can be added');
      }
    }

    // Only one mother allowed
    if (relationship === RelationshipType.MOTHER) {
      const existingMother = await this.prisma.willPerson.findFirst({
        where: {
          willId,
          relationship: RelationshipType.MOTHER,
          ...(excludePersonId && { id: { not: excludePersonId } }),
        },
      });

      if (existingMother) {
        throw new BadRequestException('Only one mother can be added');
      }
    }

    // Only one father allowed
    if (relationship === RelationshipType.FATHER) {
      const existingFather = await this.prisma.willPerson.findFirst({
        where: {
          willId,
          relationship: RelationshipType.FATHER,
          ...(excludePersonId && { id: { not: excludePersonId } }),
        },
      });

      if (existingFather) {
        throw new BadRequestException('Only one father can be added');
      }
    }

    // Children must be SON or DAUGHTER
    if (relationship === RelationshipType.SON || relationship === RelationshipType.DAUGHTER) {
      // This is valid, no additional validation needed
    }
  }

  async createGuardian(willId: string, userId: string, createGuardianDto: CreateGuardianDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Verify child exists and is a minor
    const child = await this.prisma.willPerson.findFirst({
      where: {
        id: createGuardianDto.childPersonId,
        willId,
      },
    });

    if (!child) {
      throw new NotFoundException(`Child person not found`);
    }

    if (!child.isMinor) {
      throw new BadRequestException('Guardian can only be assigned to minor children');
    }

    // Verify guardian exists and is an adult
    const guardian = await this.prisma.willPerson.findFirst({
      where: {
        id: createGuardianDto.guardianPersonId,
        willId,
      },
    });

    if (!guardian) {
      throw new NotFoundException(`Guardian person not found`);
    }

    if (guardian.isMinor) {
      throw new BadRequestException('Guardian must be an adult');
    }

    // Verify alternate guardian if provided
    if (createGuardianDto.alternateGuardianPersonId) {
      const alternateGuardian = await this.prisma.willPerson.findFirst({
        where: {
          id: createGuardianDto.alternateGuardianPersonId,
          willId,
        },
      });

      if (!alternateGuardian) {
        throw new NotFoundException(`Alternate guardian person not found`);
      }

      if (alternateGuardian.isMinor) {
        throw new BadRequestException('Alternate guardian must be an adult');
      }
    }

    // Check if guardian assignment already exists
    const existing = await this.prisma.guardianAssignment.findFirst({
      where: {
        willId,
        childPersonId: createGuardianDto.childPersonId,
      },
    });

    if (existing) {
      throw new BadRequestException('Guardian already assigned to this child');
    }

    const guardianAssignment = await this.prisma.guardianAssignment.create({
      data: {
        willId,
        childPersonId: createGuardianDto.childPersonId,
        guardianPersonId: createGuardianDto.guardianPersonId,
        alternateGuardianPersonId: createGuardianDto.alternateGuardianPersonId,
      },
      include: {
        child: true,
        guardian: true,
        alternateGuardian: true,
      },
    });

    return guardianAssignment;
  }

  async getGuardians(willId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    return this.prisma.guardianAssignment.findMany({
      where: { willId },
      include: {
        child: true,
        guardian: true,
        alternateGuardian: true,
      },
    });
  }

  private async updateStepStatus(willId: string) {
    const people = await this.prisma.willPerson.findMany({
      where: { willId },
    });

    // Check if minors have guardians
    const minors = people.filter((p) => p.isMinor);
    const guardians = await this.prisma.guardianAssignment.findMany({
      where: { willId },
    });

    let stepStatus: StepStatus;
    if (people.length === 0) {
      stepStatus = StepStatus.NOT_STARTED;
    } else if (minors.length > 0 && guardians.length < minors.length) {
      // Minors exist but not all have guardians
      stepStatus = StepStatus.IN_PROGRESS;
    } else {
      stepStatus = StepStatus.COMPLETED;
    }

    await this.prisma.will.update({
      where: { id: willId },
      data: { stepFamily: stepStatus },
    });
  }
}
