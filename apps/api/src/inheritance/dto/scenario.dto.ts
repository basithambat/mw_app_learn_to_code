import { IsEnum, IsString, IsOptional, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ScenarioType } from '@prisma/client';

class AllocationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  personId: string;

  @ApiProperty()
  @IsNotEmpty()
  percentage: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

class ScenarioAllocationDto {
  @ApiProperty({ type: [AllocationDto] })
  @ValidateNested({ each: true })
  @Type(() => AllocationDto)
  allocations: AllocationDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  meta?: Record<string, any>;
}

export class CreateScenarioDto {
  @ApiProperty({ enum: ScenarioType })
  @IsEnum(ScenarioType)
  type: ScenarioType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: ScenarioAllocationDto })
  @ValidateNested()
  @Type(() => ScenarioAllocationDto)
  allocationJson: ScenarioAllocationDto;
}
