import { Module } from '@nestjs/common';
import { ArrangementsController } from './arrangements.controller';
import { ArrangementsService } from './arrangements.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ArrangementsController],
  providers: [ArrangementsService, PrismaService],
  exports: [ArrangementsService],
})
export class ArrangementsModule {}
