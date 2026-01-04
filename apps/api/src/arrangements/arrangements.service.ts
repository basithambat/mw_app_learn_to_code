import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignExecutorDto,
  CreateWitnessDto,
  UpdateWitnessDto,
  UploadSignatureDto,
  UploadConsentVideoDto,
  AcceptDeclarationDto,
} from './dto/arrangements.dto';
import { StepStatus, SignatureType, ConsentVideoStatus } from '@prisma/client';

@Injectable()
export class ArrangementsService {
  constructor(private prisma: PrismaService) {}

  async assignExecutor(willId: string, userId: string, assignExecutorDto: AssignExecutorDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
      include: {
        people: true,
        executorAssignments: true,
      },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Verify person exists and belongs to will
    const person = await this.prisma.willPerson.findFirst({
      where: {
        id: assignExecutorDto.personId,
        willId,
      },
    });

    if (!person) {
      throw new NotFoundException(`Person with ID ${assignExecutorDto.personId} not found`);
    }

    // Remove existing executor assignments
    await this.prisma.executorAssignment.deleteMany({
      where: { willId },
    });

    // Create new executor assignment
    const executor = await this.prisma.executorAssignment.create({
      data: {
        willId,
        personId: assignExecutorDto.personId,
        isPrimary: true,
      },
      include: { person: true },
    });

    await this.updateStepStatus(willId);

    return executor;
  }

  async createWitness(willId: string, userId: string, createWitnessDto: CreateWitnessDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
      include: {
        people: true,
        executorAssignments: { include: { person: true } },
        scenarios: true,
      },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Validate witness eligibility
    const validation = await this.validateWitness(will, createWitnessDto);
    if (!validation.isEligible) {
      throw new BadRequestException(`Witness not eligible: ${validation.reasons.join(', ')}`);
    }

    const witness = await this.prisma.witness.create({
      data: {
        willId,
        fullName: createWitnessDto.fullName,
        email: createWitnessDto.email,
        phone: createWitnessDto.phone,
        addressLine: createWitnessDto.addressLine,
        status: 'PENDING',
        isBeneficiaryConflict: validation.isBeneficiaryConflict,
        isExecutorConflict: validation.isExecutorConflict,
      },
    });

    await this.updateStepStatus(willId);

    return witness;
  }

  async findAllWitnesses(willId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    return this.prisma.witness.findMany({
      where: { willId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateWitness(
    willId: string,
    witnessId: string,
    userId: string,
    updateWitnessDto: UpdateWitnessDto,
  ) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
      include: {
        people: true,
        executorAssignments: { include: { person: true } },
      },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const existingWitness = await this.prisma.witness.findFirst({
      where: { id: witnessId, willId },
    });

    if (!existingWitness) {
      throw new NotFoundException(`Witness with ID ${witnessId} not found`);
    }

    // Re-validate if name/email changed
    if (updateWitnessDto.fullName || updateWitnessDto.email) {
      const validation = await this.validateWitness(will, {
        fullName: updateWitnessDto.fullName || existingWitness.fullName,
        email: updateWitnessDto.email || existingWitness.email,
        phone: updateWitnessDto.phone || existingWitness.phone,
      });
      if (!validation.isEligible) {
        throw new BadRequestException(`Witness not eligible: ${validation.reasons.join(', ')}`);
      }
    }

    const witness = await this.prisma.witness.update({
      where: { id: witnessId },
      data: {
        fullName: updateWitnessDto.fullName,
        email: updateWitnessDto.email,
        phone: updateWitnessDto.phone,
        addressLine: updateWitnessDto.addressLine,
        isBeneficiaryConflict: updateWitnessDto.isBeneficiaryConflict,
        isExecutorConflict: updateWitnessDto.isExecutorConflict,
      },
    });

    return witness;
  }

  async removeWitness(willId: string, witnessId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const witness = await this.prisma.witness.findFirst({
      where: { id: witnessId, willId },
    });

    if (!witness) {
      throw new NotFoundException(`Witness with ID ${witnessId} not found`);
    }

    await this.prisma.witness.delete({
      where: { id: witnessId },
    });

    await this.updateStepStatus(willId);

    return { message: 'Witness deleted successfully' };
  }

  async uploadSignature(willId: string, userId: string, uploadSignatureDto: UploadSignatureDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Check if declaration was accepted
    if (!will.declarationAcceptedAt) {
      throw new BadRequestException('Capacity declaration must be accepted before signature');
    }

    const signature = await this.prisma.signature.upsert({
      where: { willId },
      create: {
        willId,
        type: uploadSignatureDto.type,
        fileUrl: uploadSignatureDto.fileUrl,
        drawnSvg: uploadSignatureDto.drawnSvg,
      },
      update: {
        type: uploadSignatureDto.type,
        fileUrl: uploadSignatureDto.fileUrl,
        drawnSvg: uploadSignatureDto.drawnSvg,
      },
    });

    await this.updateStepStatus(willId);

    return signature;
  }

  async uploadConsentVideo(
    willId: string,
    userId: string,
    uploadConsentVideoDto: UploadConsentVideoDto,
  ) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const consentVideo = await this.prisma.consentVideo.upsert({
      where: { willId },
      create: {
        willId,
        status: ConsentVideoStatus.RECORDED,
        videoUrl: uploadConsentVideoDto.videoUrl,
        transcript: uploadConsentVideoDto.transcript,
      },
      update: {
        status: ConsentVideoStatus.RECORDED,
        videoUrl: uploadConsentVideoDto.videoUrl,
        transcript: uploadConsentVideoDto.transcript,
      },
    });

    return consentVideo;
  }

  async acceptDeclaration(willId: string, userId: string, acceptDeclarationDto: AcceptDeclarationDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    if (!acceptDeclarationDto.accepted) {
      throw new BadRequestException('Declaration must be accepted');
    }

    const updatedWill = await this.prisma.will.update({
      where: { id: willId },
      data: {
        declarationAcceptedAt: new Date(),
      },
    });

    return updatedWill;
  }

  private async validateWitness(will: any, witnessData: any): Promise<{
    isEligible: boolean;
    reasons: string[];
    isBeneficiaryConflict: boolean;
    isExecutorConflict: boolean;
  }> {
    const reasons: string[] = [];
    let isBeneficiaryConflict = false;
    let isExecutorConflict = false;

    // Check if witness is a beneficiary (check scenarios)
    for (const scenario of will.scenarios || []) {
      const allocations = (scenario.allocationJson as any).allocations || [];
      for (const allocation of allocations) {
        const person = will.people.find((p: any) => p.id === allocation.personId);
        if (person) {
          // Check if witness name/email matches beneficiary
          if (
            person.email &&
            witnessData.email &&
            person.email.toLowerCase() === witnessData.email.toLowerCase()
          ) {
            isBeneficiaryConflict = true;
            reasons.push('Witness cannot be a beneficiary');
          }
          if (
            person.fullName &&
            witnessData.fullName &&
            person.fullName.toLowerCase() === witnessData.fullName.toLowerCase()
          ) {
            isBeneficiaryConflict = true;
            reasons.push('Witness name matches a beneficiary');
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
        isExecutorConflict = true;
        reasons.push('Witness should not be the executor (recommended)');
      }
      if (
        executor.fullName &&
        witnessData.fullName &&
        executor.fullName.toLowerCase() === witnessData.fullName.toLowerCase()
      ) {
        isExecutorConflict = true;
        reasons.push('Witness name matches executor (recommended against)');
      }
    }

    // Check if witness is spouse/children/parents (recommended against)
    for (const person of will.people || []) {
      if (
        ['SPOUSE', 'SON', 'DAUGHTER', 'MOTHER', 'FATHER'].includes(person.relationship) &&
        person.email &&
        witnessData.email &&
        person.email.toLowerCase() === witnessData.email.toLowerCase()
      ) {
        reasons.push('Witness is a close family member (recommended against)');
      }
    }

    // Must have email or phone
    if (!witnessData.email && !witnessData.phone) {
      reasons.push('Witness must have email or phone');
    }

    const isEligible = !isBeneficiaryConflict && reasons.filter((r) => !r.includes('recommended')).length === 0;

    return {
      isEligible,
      reasons,
      isBeneficiaryConflict,
      isExecutorConflict,
    };
  }

  private async updateStepStatus(willId: string) {
    const will = await this.prisma.will.findUnique({
      where: { id: willId },
      include: {
        executorAssignments: true,
        witnesses: true,
        signature: true,
      },
    });

    if (!will) return;

    // Check completion criteria
    const hasExecutor = will.executorAssignments.length > 0;
    const hasTwoWitnesses = will.witnesses.length >= 2;
    const hasSignature = !!will.signature;
    const hasDeclaration = !!will.declarationAcceptedAt;

    let stepStatus: StepStatus;
    if (hasExecutor && hasTwoWitnesses && hasSignature && hasDeclaration) {
      stepStatus = StepStatus.COMPLETED;
    } else if (hasExecutor || hasTwoWitnesses || hasSignature) {
      stepStatus = StepStatus.IN_PROGRESS;
    } else {
      stepStatus = StepStatus.NOT_STARTED;
    }

    await this.prisma.will.update({
      where: { id: willId },
      data: { stepArrangements: stepStatus },
    });
  }
}
