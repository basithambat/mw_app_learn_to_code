import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PersonalLaw, WillStatus, StepStatus, Gender } from '@prisma/client';

export class WillProfileDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  religionLabel?: string;

  @ApiProperty({ enum: PersonalLaw, required: false })
  @IsEnum(PersonalLaw)
  @IsOptional()
  personalLaw?: PersonalLaw;
}

export class CreateWillDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ enum: PersonalLaw, required: false })
  @IsEnum(PersonalLaw)
  @IsOptional()
  personalLaw?: PersonalLaw;

  @ApiProperty({ required: false, default: false })
  @IsBoolean()
  @IsOptional()
  previousWillExists?: boolean;

  @ApiProperty({ type: WillProfileDto, required: false })
  @ValidateNested()
  @Type(() => WillProfileDto)
  @IsOptional()
  profile?: WillProfileDto;
}

export class UpdateWillDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ enum: WillStatus, required: false })
  @IsEnum(WillStatus)
  @IsOptional()
  status?: WillStatus;

  @ApiProperty({ enum: PersonalLaw, required: false })
  @IsEnum(PersonalLaw)
  @IsOptional()
  personalLaw?: PersonalLaw;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  previousWillExists?: boolean;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  declarationAcceptedAt?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  legalHeirsConfirmedAt?: string;

  @ApiProperty({ enum: StepStatus, required: false })
  @IsEnum(StepStatus)
  @IsOptional()
  stepBasicInfo?: StepStatus;

  @ApiProperty({ enum: StepStatus, required: false })
  @IsEnum(StepStatus)
  @IsOptional()
  stepFamily?: StepStatus;

  @ApiProperty({ enum: StepStatus, required: false })
  @IsEnum(StepStatus)
  @IsOptional()
  stepArrangements?: StepStatus;

  @ApiProperty({ enum: StepStatus, required: false })
  @IsEnum(StepStatus)
  @IsOptional()
  stepAssets?: StepStatus;

  @ApiProperty({ enum: StepStatus, required: false })
  @IsEnum(StepStatus)
  @IsOptional()
  stepLegalReview?: StepStatus;

  @ApiProperty({ type: WillProfileDto, required: false })
  @ValidateNested()
  @Type(() => WillProfileDto)
  @IsOptional()
  profile?: WillProfileDto;
}
