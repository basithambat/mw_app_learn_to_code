import { Module } from '@nestjs/common';
import { PersonalLawService } from './personal-law.service';
import { MuslimLawService } from './muslim-law.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PersonalLawService, MuslimLawService, PrismaService],
  exports: [PersonalLawService, MuslimLawService],
})
export class PersonalLawModule { }
