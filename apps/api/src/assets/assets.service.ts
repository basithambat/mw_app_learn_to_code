import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawService } from '../personal-law/personal-law.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { AssetCategory, OwnershipType, StepStatus } from '@prisma/client';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private personalLawService: PersonalLawService,
  ) {}

  async create(willId: string, userId: string, createAssetDto: CreateAssetDto) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    // Validate ownership type and show warnings for ancestral/HUF
    const warnings: string[] = [];
    if (
      createAssetDto.ownershipType === OwnershipType.ANCESTRAL ||
      createAssetDto.ownershipType === OwnershipType.HUF
    ) {
      warnings.push(
        'You can only will your share of ancestral/HUF property, not the entire property.',
      );
    }

    const asset = await this.prisma.asset.create({
      data: {
        willId,
        category: createAssetDto.category,
        title: createAssetDto.title,
        description: createAssetDto.description,
        ownershipType: createAssetDto.ownershipType,
        ownershipShare: createAssetDto.ownershipShare,
        estimatedValue: createAssetDto.estimatedValue,
        currency: createAssetDto.currency || 'INR',
        metadataJson: createAssetDto.metadataJson,
        transferToJson: createAssetDto.transferToJson,
      },
    });

    await this.updateStepStatus(willId);

    return {
      asset,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async findAll(willId: string, userId: string, category?: AssetCategory) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    return this.prisma.asset.findMany({
      where: {
        willId,
        ...(category && { category }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(willId: string, assetId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const asset = await this.prisma.asset.findFirst({
      where: {
        id: assetId,
        willId,
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    return asset;
  }

  async update(
    willId: string,
    assetId: string,
    userId: string,
    updateAssetDto: UpdateAssetDto,
  ) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const existingAsset = await this.prisma.asset.findFirst({
      where: { id: assetId, willId },
    });

    if (!existingAsset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    // Validate ownership type changes
    const warnings: string[] = [];
    if (
      updateAssetDto.ownershipType === OwnershipType.ANCESTRAL ||
      updateAssetDto.ownershipType === OwnershipType.HUF
    ) {
      warnings.push(
        'You can only will your share of ancestral/HUF property, not the entire property.',
      );
    }

    const asset = await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        category: updateAssetDto.category,
        title: updateAssetDto.title,
        description: updateAssetDto.description,
        ownershipType: updateAssetDto.ownershipType,
        ownershipShare: updateAssetDto.ownershipShare,
        estimatedValue: updateAssetDto.estimatedValue,
        currency: updateAssetDto.currency,
        metadataJson: updateAssetDto.metadataJson,
        transferToJson: updateAssetDto.transferToJson,
      },
    });

    return {
      asset,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async remove(willId: string, assetId: string, userId: string) {
    // Verify will ownership
    const will = await this.prisma.will.findFirst({
      where: { id: willId, userId },
    });

    if (!will) {
      throw new NotFoundException(`Will with ID ${willId} not found`);
    }

    const asset = await this.prisma.asset.findFirst({
      where: { id: assetId, willId },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${assetId} not found`);
    }

    await this.prisma.asset.delete({
      where: { id: assetId },
    });

    await this.updateStepStatus(willId);

    return { message: 'Asset deleted successfully' };
  }

  private async updateStepStatus(willId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { willId },
    });

    const stepStatus = assets.length > 0 ? StepStatus.IN_PROGRESS : StepStatus.NOT_STARTED;

    await this.prisma.will.update({
      where: { id: willId },
      data: { stepAssets: stepStatus },
    });
  }
}
