import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('assets')
@Controller('wills/:willId/assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async create(
    @Request() req,
    @Param('willId') willId: string,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    return this.assetsService.create(willId, req.user.id, createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets for a will' })
  @ApiQuery({ name: 'category', required: false, enum: ['REAL_ESTATE', 'VEHICLE', 'GADGET', 'JEWELLERY', 'BUSINESS', 'INVESTMENT', 'LIABILITY', 'BANK_ACCOUNT', 'INSURANCE', 'OTHER'] })
  @ApiResponse({ status: 200, description: 'List of assets' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async findAll(
    @Request() req,
    @Param('willId') willId: string,
    @Query('category') category?: string,
  ) {
    return this.assetsService.findAll(willId, req.user.id, category as any);
  }

  @Get(':assetId')
  @ApiOperation({ summary: 'Get an asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async findOne(
    @Request() req,
    @Param('willId') willId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assetsService.findOne(willId, assetId, req.user.id);
  }

  @Patch(':assetId')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async update(
    @Request() req,
    @Param('willId') willId: string,
    @Param('assetId') assetId: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(willId, assetId, req.user.id, updateAssetDto);
  }

  @Delete(':assetId')
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async remove(
    @Request() req,
    @Param('willId') willId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.assetsService.remove(willId, assetId, req.user.id);
  }
}
