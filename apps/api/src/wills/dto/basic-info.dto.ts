import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, PersonalLaw } from '@prisma/client';

export class UpdateBasicInfoDto {
  @ApiProperty({ required: false, minLength: 2 })
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  fullName?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => {
    if (o.dateOfBirth) {
      const dob = new Date(o.dateOfBirth);
      const today = new Date();
      return dob <= today;
    }
    return true;
  })
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

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  previousWillExists?: boolean;
}
