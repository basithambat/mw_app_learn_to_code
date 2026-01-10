import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkGuardianDto {
    @ApiProperty({ description: 'ID of the guardian person' })
    @IsString()
    @IsNotEmpty()
    guardianPersonId: string;

    @ApiProperty({ description: 'IDs of the children persons (must be minors)', type: [String] })
    @IsArray()
    @IsString({ each: true })
    childPersonIds: string[];

    @ApiProperty({ description: 'ID of alternate guardian (optional)', required: false })
    @IsString()
    @IsOptional()
    alternateGuardianPersonId?: string;
}
