import { IsString, IsOptional, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({ required: false, description: 'Will ID for context' })
  @IsString()
  @IsOptional()
  willId?: string;

  @ApiProperty({ description: 'User question' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ required: false, description: 'Additional context (screen, step, etc.)' })
  @IsObject()
  @IsOptional()
  context?: {
    screen?: string;
    step?: string;
    assetType?: string;
    [key: string]: any;
  };
}

export class EscalateDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  willId?: string;

  @ApiProperty({ description: 'Reason for escalation' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ required: false, description: 'Original question that led to escalation' })
  @IsString()
  @IsOptional()
  question?: string;
}
