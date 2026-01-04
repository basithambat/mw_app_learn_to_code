import { Module } from '@nestjs/common';
import { LegalAidController } from './legal-aid.controller';
import { LegalAidService } from './legal-aid.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [LegalAidController],
  providers: [LegalAidService, PrismaService],
  exports: [LegalAidService],
})
export class LegalAidModule {}
