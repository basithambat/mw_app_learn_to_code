import { Module } from '@nestjs/common';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { PrismaService } from '../prisma/prisma.service';
import { WillsModule } from '../wills/wills.module';

@Module({
  imports: [WillsModule],
  controllers: [PeopleController],
  providers: [PeopleService, PrismaService],
  exports: [PeopleService],
})
export class PeopleModule {}
