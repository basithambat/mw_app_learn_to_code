import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawModule } from '../personal-law/personal-law.module';

@Module({
  imports: [PersonalLawModule],
  providers: [ValidationService, PrismaService],
  exports: [ValidationService],
})
export class ValidationModule {}
