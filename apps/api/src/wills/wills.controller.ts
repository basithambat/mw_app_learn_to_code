import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WillsService } from './wills.service';
import { CreateWillDto, UpdateWillDto } from './dto/will.dto';
import { UpdateBasicInfoDto } from './dto/basic-info.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wills')
@Controller('wills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WillsController {
  constructor(private readonly willsService: WillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new will' })
  @ApiResponse({ status: 201, description: 'Will created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createWillDto: CreateWillDto) {
    return this.willsService.create(req.user.id, createWillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all wills for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of wills' })
  async findAll(@Request() req) {
    return this.willsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a will by ID' })
  @ApiResponse({ status: 200, description: 'Will details' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.willsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a will' })
  @ApiResponse({ status: 200, description: 'Will updated successfully' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateWillDto: UpdateWillDto,
  ) {
    return this.willsService.update(id, req.user.id, updateWillDto);
  }

  @Post(':id/version')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create a new version of the will' })
  @ApiResponse({ status: 200, description: 'Version placeholder created' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async createVersion(@Request() req, @Param('id') id: string) {
    return this.willsService.createVersion(id, req.user.id);
  }

  @Patch(':id/basic-info')
  @ApiOperation({ summary: 'Update basic info (Step 1)' })
  @ApiResponse({ status: 200, description: 'Basic info updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async updateBasicInfo(
    @Request() req,
    @Param('id') id: string,
    @Body() updateBasicInfoDto: UpdateBasicInfoDto,
  ) {
    return this.willsService.updateBasicInfo(id, req.user.id, updateBasicInfoDto);
  }
}
