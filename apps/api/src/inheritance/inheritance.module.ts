import { Module } from '@nestjs/common';
import { InheritanceController } from './inheritance.controller';
import { InheritanceService } from './inheritance.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [InheritanceController],
  providers: [InheritanceService, PrismaService],
  exports: [InheritanceService],
})
export class InheritanceModule {}
