import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LegalAidRequestType, LegalAidRequestStatus } from '@prisma/client';

export class CreateLegalAidRequestDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  willId?: string;

  @ApiProperty({ enum: LegalAidRequestType })
  @IsEnum(LegalAidRequestType)
  type: LegalAidRequestType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  priceInr?: number;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class UpdateStatusDto {
  @ApiProperty({ enum: LegalAidRequestStatus })
  @IsEnum(LegalAidRequestStatus)
  status: LegalAidRequestStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  pricePaid?: number;
}
