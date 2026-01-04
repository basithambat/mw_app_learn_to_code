import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawService } from '../personal-law/personal-law.service';
import { PersonalLaw, WillStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

describe('PdfService', () => {
  let service: PdfService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    will: {
      findFirst: jest.fn(),
    },
    willPdfVersion: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockPersonalLawService = {
    getTemplateType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PersonalLawService,
          useValue: mockPersonalLawService,
        },
      ],
    }).compile();

    service = module.get<PdfService>(PdfService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePdf', () => {
    it('should throw error if executor not assigned', async () => {
      const mockWill = {
        id: 'will1',
        userId: 'user1',
        executorAssignments: [],
        witnesses: [],
        signature: null,
        declarationAcceptedAt: null,
      };

      mockPrismaService.will.findFirst.mockResolvedValue(mockWill);

      await expect(service.generatePdf('will1', 'user1')).rejects.toThrow(
        'Executor must be assigned',
      );
    });

    it('should throw error if less than 2 witnesses', async () => {
      const mockWill = {
        id: 'will1',
        userId: 'user1',
        executorAssignments: [{ personId: 'exec1' }],
        witnesses: [{ id: 'w1' }],
        signature: null,
        declarationAcceptedAt: null,
      };

      mockPrismaService.will.findFirst.mockResolvedValue(mockWill);

      await expect(service.generatePdf('will1', 'user1')).rejects.toThrow(
        'At least 2 witnesses are required',
      );
    });

    it('should throw error if signature missing', async () => {
      const mockWill = {
        id: 'will1',
        userId: 'user1',
        executorAssignments: [{ personId: 'exec1' }],
        witnesses: [{ id: 'w1' }, { id: 'w2' }],
        signature: null,
        declarationAcceptedAt: new Date(),
      };

      mockPrismaService.will.findFirst.mockResolvedValue(mockWill);

      await expect(service.generatePdf('will1', 'user1')).rejects.toThrow('Signature is required');
    });
  });

  describe('getLatestPdf', () => {
    it('should return latest PDF version', async () => {
      const mockWill = {
        id: 'will1',
        userId: 'user1',
      };

      const mockPdf = {
        id: 'pdf1',
        versionNumber: 1,
        fileUrl: '/uploads/wills/will1/will_v1.pdf',
        fileHash: 'hash123',
      };

      mockPrismaService.will.findFirst.mockResolvedValue(mockWill);
      mockPrismaService.willPdfVersion.findFirst = jest.fn().mockResolvedValue(mockPdf);

      const result = await service.getLatestPdf('will1', 'user1');

      expect(result).toEqual(mockPdf);
    });

    it('should throw error if PDF not found', async () => {
      const mockWill = {
        id: 'will1',
        userId: 'user1',
      };

      mockPrismaService.will.findFirst.mockResolvedValue(mockWill);
      mockPrismaService.willPdfVersion.findFirst = jest.fn().mockResolvedValue(null);

      await expect(service.getLatestPdf('will1', 'user1')).rejects.toThrow('No PDF found');
    });
  });
});
