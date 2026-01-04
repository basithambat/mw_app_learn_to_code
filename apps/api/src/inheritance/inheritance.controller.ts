import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InheritanceService } from './inheritance.service';
import { CreateScenarioDto } from './dto/scenario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inheritance')
@Controller('wills/:willId/inheritance/scenarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InheritanceController {
  constructor(private readonly inheritanceService: InheritanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update an inheritance scenario' })
  @ApiResponse({ status: 201, description: 'Scenario created/updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async create(
    @Request() req,
    @Param('willId') willId: string,
    @Body() createScenarioDto: CreateScenarioDto,
  ) {
    return this.inheritanceService.create(willId, req.user.id, createScenarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inheritance scenarios for a will' })
  @ApiResponse({ status: 200, description: 'List of scenarios' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async findAll(@Request() req, @Param('willId') willId: string) {
    return this.inheritanceService.findAll(willId, req.user.id);
  }
}
