import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGuardianDto {
  @ApiProperty({ description: 'ID of the child person (must be a minor)' })
  @IsString()
  @IsNotEmpty()
  childPersonId: string;

  @ApiProperty({ description: 'ID of the guardian person' })
  @IsString()
  @IsNotEmpty()
  guardianPersonId: string;

  @ApiProperty({ description: 'ID of alternate guardian (optional)', required: false })
  @IsString()
  @IsOptional()
  alternateGuardianPersonId?: string;
}
