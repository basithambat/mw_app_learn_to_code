import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLawService } from '../personal-law/personal-law.service';
import { PersonalLaw, WillStatus, StepStatus } from '@prisma/client';

describe('ValidationService', () => {
  let service: ValidationService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    will: {
      findUnique: jest.fn(),
    },
    asset: {
      findMany: jest.fn(),
    },
  };

  const mockPersonalLawService = {
    computeMuslimHeirStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationService,
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

    service = module.get<ValidationService>(ValidationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateWillCompletion', () => {
    it('should return errors for incomplete will', async () => {
      const mockWill = {
        id: 'will1',
        profile: null,
        executorAssignments: [],
        witnesses: [],
        signature: null,
        declarationAcceptedAt: null,
        scenarios: [],
        people: [],
        guardianAssignments: [],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);
      mockPrismaService.asset.findMany.mockResolvedValue([]);

      const result = await service.validateWillCompletion('will1');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Executor must be assigned');
      expect(result.errors).toContain('At least 2 witnesses are required');
      expect(result.errors).toContain('Signature is required');
    });

    it('should return errors for minors without guardians', async () => {
      const mockWill = {
        id: 'will1',
        profile: { fullName: 'Test', dateOfBirth: new Date('1980-01-01'), personalLaw: PersonalLaw.HINDU },
        executorAssignments: [{ personId: 'exec1' }],
        witnesses: [{ id: 'w1' }, { id: 'w2' }],
        signature: { id: 'sig1' },
        declarationAcceptedAt: new Date(),
        scenarios: [{ id: 'sc1' }],
        people: [
          {
            id: 'child1',
            fullName: 'Minor Child',
            isMinor: true,
          },
        ],
        guardianAssignments: [],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);
      mockPrismaService.asset.findMany.mockResolvedValue([]);

      const result = await service.validateWillCompletion('will1');

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Guardian must be assigned'))).toBe(true);
    });

    it('should return warnings for witness conflicts', async () => {
      const mockWill = {
        id: 'will1',
        profile: { fullName: 'Test', dateOfBirth: new Date('1980-01-01'), personalLaw: PersonalLaw.HINDU },
        executorAssignments: [{ personId: 'exec1', person: { id: 'exec1', fullName: 'Executor' } }],
        witnesses: [
          {
            id: 'w1',
            fullName: 'Witness 1',
            isBeneficiaryConflict: true,
            isExecutorConflict: false,
          },
          {
            id: 'w2',
            fullName: 'Witness 2',
            isBeneficiaryConflict: false,
            isExecutorConflict: true,
          },
        ],
        signature: { id: 'sig1' },
        declarationAcceptedAt: new Date(),
        scenarios: [{ id: 'sc1' }],
        people: [],
        guardianAssignments: [],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);
      mockPrismaService.asset.findMany.mockResolvedValue([]);

      const result = await service.validateWillCompletion('will1');

      expect(result.errors.some((e) => e.includes('cannot be a beneficiary'))).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateMuslimBequests', () => {
    it('should return warnings for exceeding 1/3 limit', async () => {
      const mockWill = {
        id: 'will1',
        personalLaw: PersonalLaw.MUSLIM,
        people: [
          { id: 'p1', isHeir: true },
          { id: 'p2', isHeir: false },
        ],
        scenarios: [
          {
            id: 'sc1',
            type: 'USER_DIES_FIRST',
            allocationJson: {
              allocations: [
                { personId: 'p1', percentage: 50 },
                { personId: 'p2', percentage: 50 }, // Non-heir gets 50% > 33.33%
              ],
            },
          },
        ],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);
      mockPersonalLawService.computeMuslimHeirStatus.mockResolvedValue(undefined);

      const result = await service.validateMuslimBequests('will1');

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('1/3');
    });
  });
});
