import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AssistantController],
  providers: [AssistantService, PrismaService],
  exports: [AssistantService],
})
export class AssistantModule {}
