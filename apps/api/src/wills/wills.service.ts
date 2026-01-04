import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWillDto, UpdateWillDto } from './dto/will.dto';
import { UpdateBasicInfoDto } from './dto/basic-info.dto';
import { PersonalLaw, WillStatus, StepStatus } from '@prisma/client';

@Injectable()
export class WillsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createWillDto: CreateWillDto) {
    const will = await this.prisma.will.create({
      data: {
        userId,
        title: createWillDto.title,
        status: WillStatus.DRAFT,
        personalLaw: createWillDto.personalLaw || PersonalLaw.UNKNOWN,
        previousWillExists: createWillDto.previousWillExists || false,
        stepBasicInfo: StepStatus.NOT_STARTED,
        stepFamily: StepStatus.NOT_STARTED,
        stepArrangements: StepStatus.NOT_STARTED,
        stepAssets: StepStatus.NOT_STARTED,
        stepLegalReview: StepStatus.NOT_STARTED,
        profile: createWillDto.profile
          ? {
              create: {
                fullName: createWillDto.profile.fullName,
                gender: createWillDto.profile.gender,
                dateOfBirth: createWillDto.profile.dateOfBirth,
                maritalStatus: createWillDto.profile.maritalStatus,
                religionLabel: createWillDto.profile.religionLabel,
                personalLaw: createWillDto.profile.personalLaw || PersonalLaw.UNKNOWN,
              },
            }
          : undefined,
      },
      include: {
        profile: true,
        people: true,
        scenarios: true,
        executorAssignments: {
          include: { person: true },
        },
        witnesses: true,
        signature: true,
        consentVideo: true,
        assets: true,
        pdfVersions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    return will;
  }

  async findOne(id: string, userId: string) {
    const will = await this.prisma.will.findFirst({
      where: {
        id,
        userId, // Ensure user owns the will
      },
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
        pdfVersions: {
          orderBy: { versionNumber: 'desc' },
        },
        legalAidRequests: true,
      },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${id} not found`);
    }

    return will;
  }

  async findAll(userId: string) {
    return this.prisma.will.findMany({
      where: { userId },
      include: {
        profile: true,
        pdfVersions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async update(id: string, userId: string, updateWillDto: UpdateWillDto) {
    // Verify ownership
    const existingWill = await this.prisma.will.findFirst({
      where: { id, userId },
    });

    if (!existingWill) {
      throw new NotFoundException(`Will with ID ${id} not found`);
    }

    const will = await this.prisma.will.update({
      where: { id },
      data: {
        title: updateWillDto.title,
        status: updateWillDto.status,
        personalLaw: updateWillDto.personalLaw,
        previousWillExists: updateWillDto.previousWillExists,
        declarationAcceptedAt: updateWillDto.declarationAcceptedAt,
        legalHeirsConfirmedAt: updateWillDto.legalHeirsConfirmedAt,
        stepBasicInfo: updateWillDto.stepBasicInfo,
        stepFamily: updateWillDto.stepFamily,
        stepArrangements: updateWillDto.stepArrangements,
        stepAssets: updateWillDto.stepAssets,
        stepLegalReview: updateWillDto.stepLegalReview,
        profile: updateWillDto.profile
          ? {
              upsert: {
                create: {
                  fullName: updateWillDto.profile.fullName,
                  gender: updateWillDto.profile.gender,
                  dateOfBirth: updateWillDto.profile.dateOfBirth,
                  maritalStatus: updateWillDto.profile.maritalStatus,
                  religionLabel: updateWillDto.profile.religionLabel,
                  personalLaw: updateWillDto.profile.personalLaw || PersonalLaw.UNKNOWN,
                },
                update: {
                  fullName: updateWillDto.profile.fullName,
                  gender: updateWillDto.profile.gender,
                  dateOfBirth: updateWillDto.profile.dateOfBirth,
                  maritalStatus: updateWillDto.profile.maritalStatus,
                  religionLabel: updateWillDto.profile.religionLabel,
                  personalLaw: updateWillDto.profile.personalLaw || PersonalLaw.UNKNOWN,
                },
              },
            }
          : undefined,
      },
      include: {
        profile: true,
        people: true,
        scenarios: true,
        executorAssignments: {
          include: { person: true },
        },
        witnesses: true,
        signature: true,
        consentVideo: true,
        assets: true,
        pdfVersions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    return will;
  }

  async createVersion(id: string, userId: string) {
    // Verify ownership
    const existingWill = await this.prisma.will.findFirst({
      where: { id, userId },
      include: {
        pdfVersions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingWill) {
      throw new NotFoundException(`Will with ID ${id} not found`);
    }

    const nextVersion = existingWill.pdfVersions[0]
      ? existingWill.pdfVersions[0].versionNumber + 1
      : 1;

    // Create a new will with incremented version logic
    // For now, we'll just return the next version number
    // Actual versioning will be handled when PDF is generated
    return {
      willId: id,
      nextVersion,
      message: 'Version placeholder created. PDF generation will create actual version.',
    };
  }

  async updateBasicInfo(id: string, userId: string, updateBasicInfoDto: UpdateBasicInfoDto) {
    // Verify ownership
    const existingWill = await this.prisma.will.findFirst({
      where: { id, userId },
      include: { profile: true },
    });

    if (!existingWill) {
      throw new NotFoundException(`Will with ID ${id} not found`);
    }

    // Validate DOB is not in future
    if (updateBasicInfoDto.dateOfBirth) {
      const dob = new Date(updateBasicInfoDto.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        throw new BadRequestException('Date of birth cannot be in the future');
      }
    }

    // Map religion to personal law
    let personalLaw = updateBasicInfoDto.personalLaw;
    if (updateBasicInfoDto.religionLabel && !personalLaw) {
      const religion = updateBasicInfoDto.religionLabel.toLowerCase();
      if (['hindu', 'jain', 'buddhist', 'sikh'].includes(religion)) {
        personalLaw = PersonalLaw.HINDU;
      } else if (religion === 'muslim') {
        personalLaw = PersonalLaw.MUSLIM;
      } else if (religion === 'christian') {
        personalLaw = PersonalLaw.CHRISTIAN;
      }
    }

    // Determine step status based on required fields
    const hasRequiredFields =
      updateBasicInfoDto.fullName &&
      updateBasicInfoDto.gender &&
      updateBasicInfoDto.dateOfBirth &&
      updateBasicInfoDto.maritalStatus &&
      personalLaw;

    const stepStatus = hasRequiredFields ? StepStatus.COMPLETED : StepStatus.IN_PROGRESS;

    // Update will and profile
    const will = await this.prisma.will.update({
      where: { id },
      data: {
        personalLaw: personalLaw || existingWill.personalLaw,
        previousWillExists: updateBasicInfoDto.previousWillExists ?? existingWill.previousWillExists,
        stepBasicInfo: stepStatus,
        profile: {
          upsert: {
            create: {
              fullName: updateBasicInfoDto.fullName,
              gender: updateBasicInfoDto.gender,
              dateOfBirth: updateBasicInfoDto.dateOfBirth
                ? new Date(updateBasicInfoDto.dateOfBirth)
                : null,
              maritalStatus: updateBasicInfoDto.maritalStatus,
              religionLabel: updateBasicInfoDto.religionLabel,
              personalLaw: personalLaw || PersonalLaw.UNKNOWN,
            },
            update: {
              fullName: updateBasicInfoDto.fullName,
              gender: updateBasicInfoDto.gender,
              dateOfBirth: updateBasicInfoDto.dateOfBirth
                ? new Date(updateBasicInfoDto.dateOfBirth)
                : undefined,
              maritalStatus: updateBasicInfoDto.maritalStatus,
              religionLabel: updateBasicInfoDto.religionLabel,
              personalLaw: personalLaw || undefined,
            },
          },
        },
      },
      include: {
        profile: true,
        people: true,
      },
    });

    return will;
  }
}
