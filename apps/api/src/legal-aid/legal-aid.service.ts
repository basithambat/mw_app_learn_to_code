import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalAidRequestDto, CreateMessageDto } from './dto/legal-aid.dto';
import { LegalAidRequestType, LegalAidRequestStatus, MessageSenderType } from '@prisma/client';

@Injectable()
export class LegalAidService {
  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, createRequestDto: CreateLegalAidRequestDto) {
    // Verify will ownership if willId provided
    if (createRequestDto.willId) {
      const will = await this.prisma.will.findFirst({
        where: { id: createRequestDto.willId, userId },
      });

      if (!will) {
        throw new NotFoundException(`Will with ID ${createRequestDto.willId} not found`);
      }
    }

    const request = await this.prisma.legalAidRequest.create({
      data: {
        userId,
        willId: createRequestDto.willId,
        type: createRequestDto.type,
        status: LegalAidRequestStatus.CREATED,
        title: createRequestDto.title,
        notes: createRequestDto.notes,
        priceInr: createRequestDto.priceInr,
        scheduledAt: createRequestDto.scheduledAt ? new Date(createRequestDto.scheduledAt) : null,
      },
    });

    return request;
  }

  async findOne(requestId: string, userId: string) {
    const request = await this.prisma.legalAidRequest.findFirst({
      where: {
        id: requestId,
        userId, // Ensure user owns the request
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        will: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Legal aid request with ID ${requestId} not found`);
    }

    return request;
  }

  async findAll(userId: string) {
    return this.prisma.legalAidRequest.findMany({
      where: { userId },
      include: {
        will: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMessage(requestId: string, userId: string, createMessageDto: CreateMessageDto) {
    // Verify request ownership
    const request = await this.prisma.legalAidRequest.findFirst({
      where: {
        id: requestId,
        userId,
      },
    });

    if (!request) {
      throw new NotFoundException(`Legal aid request with ID ${requestId} not found`);
    }

    const message = await this.prisma.legalAidMessage.create({
      data: {
        requestId,
        senderType: MessageSenderType.USER,
        message: createMessageDto.message,
      },
    });

    return message;
  }

  async updateRequestStatus(
    requestId: string,
    userId: string,
    status: LegalAidRequestStatus,
    pricePaid?: number,
  ) {
    // Verify request ownership
    const request = await this.prisma.legalAidRequest.findFirst({
      where: {
        id: requestId,
        userId,
      },
    });

    if (!request) {
      throw new NotFoundException(`Legal aid request with ID ${requestId} not found`);
    }

    const updatedRequest = await this.prisma.legalAidRequest.update({
      where: { id: requestId },
      data: {
        status,
        priceInr: pricePaid || request.priceInr,
        paidAt: status === LegalAidRequestStatus.PAID ? new Date() : request.paidAt,
      },
    });

    return updatedRequest;
  }
}
