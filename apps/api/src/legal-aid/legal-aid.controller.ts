import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LegalAidService } from './legal-aid.service';
import { CreateLegalAidRequestDto, CreateMessageDto, UpdateStatusDto } from './dto/legal-aid.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('legal-aid')
@Controller('legal-aid/requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LegalAidController {
  constructor(private readonly legalAidService: LegalAidService) {}

  @Post()
  @ApiOperation({ summary: 'Create a legal aid request' })
  @ApiResponse({ status: 201, description: 'Request created successfully' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async create(@Request() req, @Body() createRequestDto: CreateLegalAidRequestDto) {
    return this.legalAidService.createRequest(req.user.id, createRequestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all legal aid requests for the user' })
  @ApiResponse({ status: 200, description: 'List of requests' })
  async findAll(@Request() req) {
    return this.legalAidService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a legal aid request by ID' })
  @ApiResponse({ status: 200, description: 'Request details' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.legalAidService.findOne(id, req.user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a legal aid request' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async createMessage(
    @Request() req,
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.legalAidService.createMessage(id, req.user.id, createMessageDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update legal aid request status (e.g., mark as paid)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Request not found' })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.legalAidService.updateRequestStatus(
      id,
      req.user.id,
      updateStatusDto.status,
      updateStatusDto.pricePaid,
    );
  }
}
