import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WillsModule } from './wills/wills.module';
import { PeopleModule } from './people/people.module';
import { InheritanceModule } from './inheritance/inheritance.module';
import { PersonalLawModule } from './personal-law/personal-law.module';
import { ArrangementsModule } from './arrangements/arrangements.module';
import { PdfModule } from './pdf/pdf.module';
import { AssetsModule } from './assets/assets.module';
import { AssistantModule } from './assistant/assistant.module';
import { LegalAidModule } from './legal-aid/legal-aid.module';
import { ValidationModule } from './validation/validation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    UsersModule,
    WillsModule,
    PeopleModule,
    InheritanceModule,
    PersonalLawModule,
    ArrangementsModule,
    PdfModule,
    AssetsModule,
    AssistantModule,
    LegalAidModule,
    ValidationModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
