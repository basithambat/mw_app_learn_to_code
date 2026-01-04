import { Module } from '@nestjs/common';
import { PersonalLawService } from './personal-law.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PersonalLawService, PrismaService],
  exports: [PersonalLawService],
})
export class PersonalLawModule {}
