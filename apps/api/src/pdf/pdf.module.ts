import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawModule } from '../personal-law/personal-law.module';

@Module({
  imports: [PersonalLawModule],
  controllers: [PdfController],
  providers: [PdfService, PrismaService],
  exports: [PdfService],
})
export class PdfModule {}
