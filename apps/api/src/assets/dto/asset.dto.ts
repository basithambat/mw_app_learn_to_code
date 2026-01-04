import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssetCategory, OwnershipType } from '@prisma/client';

export class CreateAssetDto {
  @ApiProperty({ enum: AssetCategory })
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: OwnershipType, default: OwnershipType.SELF_ACQUIRED })
  @IsEnum(OwnershipType)
  ownershipType: OwnershipType;

  @ApiProperty({ required: false, description: 'Percentage of ownership (0-100)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ownershipShare?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedValue?: number;

  @ApiProperty({ required: false, default: 'INR' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false, description: 'Flexible metadata JSON' })
  @IsObject()
  @IsOptional()
  metadataJson?: Record<string, any>;

  @ApiProperty({
    required: false,
    description: 'Transfer instructions: { beneficiaries: [{ personId, percentage }] }',
  })
  @IsObject()
  @IsOptional()
  transferToJson?: Record<string, any>;
}

export class UpdateAssetDto {
  @ApiProperty({ enum: AssetCategory, required: false })
  @IsEnum(AssetCategory)
  @IsOptional()
  category?: AssetCategory;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: OwnershipType, required: false })
  @IsEnum(OwnershipType)
  @IsOptional()
  ownershipType?: OwnershipType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  ownershipShare?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedValue?: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadataJson?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  transferToJson?: Record<string, any>;
}
