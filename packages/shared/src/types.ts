// Shared TypeScript types and interfaces

export interface Allocation {
  personId: string;
  percentage: number;
  description?: string;
}

export interface InheritanceScenario {
  scenarioType: string;
  allocations: Allocation[];
  fallbackRules?: string[];
}

export interface StepStatusMap {
  [key: string]: string; // WillStep -> StepStatus
}

export interface PersonalLawConfig {
  religion: string;
  sect?: string;
  familyMembers: string[];
  assetOwnershipTypes: string[];
}

export interface AssetMetadata {
  value?: number;
  purchaseDate?: string;
  loanAmount?: number;
  insurance?: string;
  location?: string;
  description?: string;
}

export interface TransferInstruction {
  personIds: string[];
  percentage?: number;
}

export interface WitnessEligibility {
  isEligible: boolean;
  reasons?: string[];
}

export interface PersonalLawValidation {
  isValid: boolean;
  warnings: string[];
  disclaimers: string[];
  allowedDistribution: boolean;
}
