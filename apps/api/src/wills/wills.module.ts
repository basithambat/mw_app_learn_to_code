import { Module } from '@nestjs/common';
import { WillsController } from './wills.controller';
import { WillsService } from './wills.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [WillsController],
  providers: [WillsService, PrismaService],
  exports: [WillsService],
})
export class WillsModule { }
