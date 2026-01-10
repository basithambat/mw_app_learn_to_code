import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PeopleService } from './people.service';
import { CreatePersonDto, UpdatePersonDto } from './dto/person.dto';
import { CreateGuardianDto } from './dto/guardian.dto';
import { BulkGuardianDto } from './dto/bulk-guardian.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('people')
@Controller('wills/:willId/people')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) { }

  @Post()
  @ApiOperation({ summary: 'Add a family member to a will' })
  @ApiResponse({ status: 201, description: 'Person created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async create(
    @Request() req,
    @Param('willId') willId: string,
    @Body() createPersonDto: CreatePersonDto,
  ) {
    return this.peopleService.create(willId, req.user.id, createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all people for a will' })
  @ApiResponse({ status: 200, description: 'List of people' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async findAll(@Request() req, @Param('willId') willId: string) {
    return this.peopleService.findAll(willId, req.user.id);
  }

  @Get(':personId')
  @ApiOperation({ summary: 'Get a person by ID' })
  @ApiResponse({ status: 200, description: 'Person details' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async findOne(
    @Request() req,
    @Param('willId') willId: string,
    @Param('personId') personId: string,
  ) {
    return this.peopleService.findOne(willId, personId, req.user.id);
  }

  @Patch(':personId')
  @ApiOperation({ summary: 'Update a person' })
  @ApiResponse({ status: 200, description: 'Person updated successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async update(
    @Request() req,
    @Param('willId') willId: string,
    @Param('personId') personId: string,
    @Body() updatePersonDto: UpdatePersonDto,
  ) {
    return this.peopleService.update(willId, personId, req.user.id, updatePersonDto);
  }

  @Delete(':personId')
  @ApiOperation({ summary: 'Delete a person' })
  @ApiResponse({ status: 200, description: 'Person deleted successfully' })
  @ApiResponse({ status: 404, description: 'Person not found' })
  async remove(
    @Request() req,
    @Param('willId') willId: string,
    @Param('personId') personId: string,
  ) {
    return this.peopleService.remove(willId, personId, req.user.id);
  }

  @Post('guardians')
  @ApiOperation({ summary: 'Assign a guardian to a minor child' })
  @ApiResponse({ status: 201, description: 'Guardian assigned successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Will or person not found' })
  async createGuardian(
    @Request() req,
    @Param('willId') willId: string,
    @Body() createGuardianDto: CreateGuardianDto,
  ) {
    return this.peopleService.createGuardian(willId, req.user.id, createGuardianDto);
  }

  @Get('guardians')
  @ApiOperation({ summary: 'Get all guardian assignments for a will' })
  @ApiResponse({ status: 200, description: 'List of guardian assignments' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async getGuardians(@Request() req, @Param('willId') willId: string) {
    return this.peopleService.getGuardians(willId, req.user.id);
  }

  @Post('guardians/bulk')
  @ApiOperation({ summary: 'Assign a guardian to multiple minor children' })
  @ApiResponse({ status: 201, description: 'Guardians assigned successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Will or person not found' })
  async createGuardianBulk(
    @Request() req,
    @Param('willId') willId: string,
    @Body() bulkGuardianDto: BulkGuardianDto,
  ) {
    return this.peopleService.assignGuardiansBulk(willId, req.user.id, bulkGuardianDto);
  }
}
