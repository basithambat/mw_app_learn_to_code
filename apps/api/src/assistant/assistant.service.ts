import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryDto, EscalateDto } from './dto/assistant.dto';
import { MessageSenderType, PersonalLaw } from '@prisma/client';

export interface AssistantResponse {
  answer: string;
  whyThisMatters: string;
  whatYouCanDoNext: string;
  deepLink?: {
    screen: string;
    params?: Record<string, any>;
  };
  disclaimer: string;
  shouldEscalate: boolean;
}

@Injectable()
export class AssistantService {
  constructor(private prisma: PrismaService) {}

  async query(userId: string, queryDto: QueryDto): Promise<AssistantResponse> {
    const { willId, question, context } = queryDto;

    // Get will context if provided
    let will = null;
    if (willId) {
      will = await this.prisma.will.findFirst({
        where: { id: willId, userId },
        include: {
          profile: true,
          people: true,
          assets: true,
          scenarios: true,
        },
      });
    }

    // Rule-based response generation
    const response = this.generateResponse(question, will, context);

    // Create or get thread
    let thread = await this.prisma.assistantThread.findFirst({
      where: {
        userId,
        willId: willId || null,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!thread) {
      thread = await this.prisma.assistantThread.create({
        data: {
          userId,
          willId: willId || null,
        },
      });
    }

    // Save user message
    await this.prisma.assistantMessage.create({
      data: {
        threadId: thread.id,
        senderType: MessageSenderType.USER,
        message: question,
        contextJson: context || {},
      },
    });

    // Save assistant response
    await this.prisma.assistantMessage.create({
      data: {
        threadId: thread.id,
        senderType: MessageSenderType.ASSISTANT,
        message: response.answer,
        contextJson: {
          whyThisMatters: response.whyThisMatters,
          whatYouCanDoNext: response.whatYouCanDoNext,
          deepLink: response.deepLink,
        },
      },
    });

    return response;
  }

  async escalate(userId: string, escalateDto: EscalateDto) {
    const { willId, reason, question } = escalateDto;

    // Create legal aid request
    const legalAidRequest = await this.prisma.legalAidRequest.create({
      data: {
        userId,
        willId: willId || null,
        type: 'CONSULTATION_CALL',
        status: 'CREATED',
        title: 'Assistant Escalation',
        notes: `Reason: ${reason}\nQuestion: ${question}`,
      },
    });

    return {
      legalAidRequest,
      message: 'Your request has been submitted. A legal expert will contact you soon.',
    };
  }

  private generateResponse(
    question: string,
    will: any,
    context: any,
  ): AssistantResponse {
    const lowerQuestion = question.toLowerCase();

    // Disclaimer (always included)
    const disclaimer =
      'This is general information, not legal advice. For specific legal matters, please consult a qualified advocate.';

    // Check for escalation triggers
    const shouldEscalate = this.shouldEscalateToHuman(lowerQuestion, will);

    // Personal law questions
    if (lowerQuestion.includes('hindu') || lowerQuestion.includes('ancestral')) {
      return {
        answer:
          'Under Hindu law, you can freely distribute self-acquired assets. However, ancestral and HUF property can only be willed as your share, not the entire property.',
        whyThisMatters:
          'If you claim 100% ownership of ancestral property in your will, it can be challenged in court.',
        whatYouCanDoNext:
          'Mark ancestral assets with their ownership type and specify only your share percentage.',
        deepLink: {
          screen: 'assets',
          params: { highlightOwnership: true },
        },
        disclaimer,
        shouldEscalate: shouldEscalate,
      };
    }

    if (lowerQuestion.includes('muslim') || lowerQuestion.includes('1/3') || lowerQuestion.includes('wasiyyat')) {
      return {
        answer:
          'Under Muslim law, bequests to non-heirs (like friends or charities) are limited to 1/3 of your estate. The remainder follows Islamic inheritance rules.',
        whyThisMatters:
          'If you exceed the 1/3 limit for non-heirs, it requires consent from heirs after your death, or the excess may be invalid.',
        whatYouCanDoNext:
          'Review your inheritance scenarios and ensure non-heir allocations don\'t exceed 33.33%.',
        deepLink: {
          screen: 'inheritance',
          params: { showMuslimWarning: true },
        },
        disclaimer,
        shouldEscalate: shouldEscalate,
      };
    }

    // Witness questions
    if (lowerQuestion.includes('witness') || lowerQuestion.includes('witnesses')) {
      return {
        answer:
          'You need at least 2 witnesses for your will. Witnesses should be adults, preferably not beneficiaries, and should not be your executor.',
        whyThisMatters:
          'Witnesses who are beneficiaries can create conflicts of interest and may invalidate your will.',
        whatYouCanDoNext:
          'Add witnesses who are independent and can verify your signature. The system will validate eligibility.',
        deepLink: {
          screen: 'arrangements',
          params: { step: 'witnesses' },
        },
        disclaimer,
        shouldEscalate: false,
      };
    }

    // Executor questions
    if (lowerQuestion.includes('executor')) {
      return {
        answer:
          'An executor is responsible for administering your estate after your death, including paying debts, distributing assets, and handling legal matters.',
        whyThisMatters:
          'Choosing a reliable executor ensures your will is executed as intended.',
        whatYouCanDoNext:
          'Select someone you trust, who is capable of handling financial and legal matters.',
        deepLink: {
          screen: 'arrangements',
          params: { step: 'executor' },
        },
        disclaimer,
        shouldEscalate: false,
      };
    }

    // Guardian questions
    if (lowerQuestion.includes('guardian') || lowerQuestion.includes('minor')) {
      return {
        answer:
          'If you have minor children, you should appoint a guardian to care for them and manage their inheritance until they turn 18.',
        whyThisMatters:
          'Without a guardian appointment, the court will decide who cares for your children, which may not align with your wishes.',
        whatYouCanDoNext:
          'Go to Family & Inheritance step and assign guardians for each minor child.',
        deepLink: {
          screen: 'family',
          params: { step: 'guardians' },
        },
        disclaimer,
        shouldEscalate: false,
      };
    }

    // Nominee questions
    if (lowerQuestion.includes('nominee')) {
      return {
        answer:
          'A nominee is not always the final owner. For bank accounts, insurance, and investments, a will can override the nominee depending on asset class.',
        whyThisMatters:
          'Many people confuse nominees with beneficiaries. Your will takes precedence in most cases.',
        whatYouCanDoNext:
          'Include these assets in your will and specify beneficiaries clearly.',
        deepLink: {
          screen: 'assets',
          params: { showNomineeDisclaimer: true },
        },
        disclaimer,
        shouldEscalate: false,
      };
    }

    // Ownership type questions
    if (lowerQuestion.includes('ownership') || lowerQuestion.includes('ancestral') || lowerQuestion.includes('joint')) {
      return {
        answer:
          'Asset ownership type matters: Self-acquired assets can be freely distributed, but ancestral, HUF, and joint assets can only be willed as your share.',
        whyThisMatters:
          'Claiming 100% ownership of ancestral/joint property can invalidate parts of your will.',
        whatYouCanDoNext:
          'When adding assets, select the correct ownership type. The system will warn you if there are risks.',
        deepLink: {
          screen: 'assets',
          params: { highlightOwnership: true },
        },
        disclaimer,
        shouldEscalate: shouldEscalate,
      };
    }

    // Default response
    return {
      answer:
        'I can help you understand will creation, personal law rules, witnesses, executors, guardians, and asset distribution. What specific question do you have?',
      whyThisMatters:
        'Understanding these concepts helps you create a valid and defensible will.',
      whatYouCanDoNext:
        'Ask me about any step in the will creation process, or escalate to a human legal expert for complex matters.',
      disclaimer,
      shouldEscalate: shouldEscalate,
    };
  }

  private shouldEscalateToHuman(question: string, will: any): boolean {
    // Escalation triggers
    const escalationKeywords = [
      'litigation',
      'lawsuit',
      'court case',
      'dispute',
      'challenge',
      'loophole',
      'contest',
    ];

    if (escalationKeywords.some((keyword) => question.includes(keyword))) {
      return true;
    }

    // If will has ancestral/HUF assets
    if (will?.assets?.some((asset: any) => ['ANCESTRAL', 'HUF'].includes(asset.ownershipType))) {
      if (question.includes('ancestral') || question.includes('huf')) {
        return true;
      }
    }

    // If Muslim and asking about >1/3
    if (will?.personalLaw === PersonalLaw.MUSLIM && question.includes('1/3')) {
      return true;
    }

    return false;
  }
}
