import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SignatureType } from '@prisma/client';

export class AssignExecutorDto {
  @ApiProperty({ description: 'ID of the person to assign as executor' })
  @IsString()
  @IsNotEmpty()
  personId: string;
}

export class CreateWitnessDto {
  @ApiProperty({ minLength: 2 })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressLine?: string;
}

export class UpdateWitnessDto {
  @ApiProperty({ required: false, minLength: 2 })
  @IsString()
  @MinLength(2)
  @IsOptional()
  fullName?: string;

  @ApiProperty({ required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressLine?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isBeneficiaryConflict?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isExecutorConflict?: boolean;
}

export class UploadSignatureDto {
  @ApiProperty({ enum: SignatureType })
  @IsEnum(SignatureType)
  type: SignatureType;

  @ApiProperty({ required: false, description: 'URL of uploaded signature image' })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @ApiProperty({ required: false, description: 'SVG string if signature was drawn' })
  @IsString()
  @IsOptional()
  drawnSvg?: string;
}

export class UploadConsentVideoDto {
  @ApiProperty({ description: 'URL of uploaded consent video' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ required: false, description: 'Transcript of the video' })
  @IsString()
  @IsOptional()
  transcript?: string;
}

export class AcceptDeclarationDto {
  @ApiProperty({ description: 'Whether the declaration is accepted' })
  @IsBoolean()
  @IsNotEmpty()
  accepted: boolean;
}
