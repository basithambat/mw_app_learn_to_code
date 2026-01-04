import { Test, TestingModule } from '@nestjs/testing';
import { PersonalLawService } from './personal-law.service';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalLaw, OwnershipType } from '@prisma/client';

describe('PersonalLawService', () => {
  let service: PersonalLawService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    will: {
      findUnique: jest.fn(),
    },
    willPerson: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalLawService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PersonalLawService>(PersonalLawService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateWill', () => {
    it('should validate Hindu will with ancestral assets', async () => {
      const mockWill = {
        id: 'will1',
        personalLaw: PersonalLaw.HINDU,
        profile: { fullName: 'Test User' },
        assets: [
          {
            title: 'Ancestral Property',
            ownershipType: OwnershipType.ANCESTRAL,
          },
        ],
        people: [],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);

      const result = await service.validateWill('will1');

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('ancestral');
      expect(result.templateType).toBe('hindu');
    });

    it('should validate Muslim will with bequest warnings', async () => {
      const mockWill = {
        id: 'will2',
        personalLaw: PersonalLaw.MUSLIM,
        profile: { fullName: 'Test User' },
        assets: [],
        people: [],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);

      const result = await service.validateWill('will2');

      expect(result.isValid).toBe(true);
      expect(result.disclaimers.length).toBeGreaterThan(0);
      expect(result.disclaimers[0]).toContain('1/3');
      expect(result.templateType).toBe('muslim');
    });

    it('should validate Christian will', async () => {
      const mockWill = {
        id: 'will3',
        personalLaw: PersonalLaw.CHRISTIAN,
        profile: { fullName: 'Test User' },
        assets: [],
        people: [],
      };

      mockPrismaService.will.findUnique.mockResolvedValue(mockWill);

      const result = await service.validateWill('will3');

      expect(result.isValid).toBe(true);
      expect(result.templateType).toBe('christian');
    });
  });

  describe('isMuslimHeir', () => {
    it('should identify Quranic heirs correctly', () => {
      expect(service['isMuslimHeir']('SPOUSE')).toBe(true);
      expect(service['isMuslimHeir']('SON')).toBe(true);
      expect(service['isMuslimHeir']('DAUGHTER')).toBe(true);
      expect(service['isMuslimHeir']('MOTHER')).toBe(true);
      expect(service['isMuslimHeir']('FATHER')).toBe(true);
      expect(service['isMuslimHeir']('BROTHER')).toBe(true);
      expect(service['isMuslimHeir']('SISTER')).toBe(true);
      expect(service['isMuslimHeir']('OTHER')).toBe(false);
    });
  });

  describe('getTemplateType', () => {
    it('should return correct template type', () => {
      expect(service.getTemplateType(PersonalLaw.HINDU)).toBe('hindu');
      expect(service.getTemplateType(PersonalLaw.MUSLIM)).toBe('muslim');
      expect(service.getTemplateType(PersonalLaw.CHRISTIAN)).toBe('christian');
      expect(service.getTemplateType(PersonalLaw.UNKNOWN)).toBe('generic');
    });
  });

  describe('shouldShowAncestralWarning', () => {
    it('should return true for ancestral/HUF/joint assets', () => {
      expect(service.shouldShowAncestralWarning(OwnershipType.ANCESTRAL)).toBe(true);
      expect(service.shouldShowAncestralWarning(OwnershipType.HUF)).toBe(true);
      expect(service.shouldShowAncestralWarning(OwnershipType.JOINT)).toBe(true);
      expect(service.shouldShowAncestralWarning(OwnershipType.SELF_ACQUIRED)).toBe(false);
    });
  });
});
