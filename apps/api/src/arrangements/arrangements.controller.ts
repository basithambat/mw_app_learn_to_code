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
import { ArrangementsService } from './arrangements.service';
import {
  AssignExecutorDto,
  CreateWitnessDto,
  UpdateWitnessDto,
  UploadSignatureDto,
  UploadConsentVideoDto,
  AcceptDeclarationDto,
} from './dto/arrangements.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('arrangements')
@Controller('wills/:willId')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArrangementsController {
  constructor(private readonly arrangementsService: ArrangementsService) {}

  @Post('executor')
  @ApiOperation({ summary: 'Assign executor to a will' })
  @ApiResponse({ status: 201, description: 'Executor assigned successfully' })
  @ApiResponse({ status: 404, description: 'Will or person not found' })
  async assignExecutor(
    @Request() req,
    @Param('willId') willId: string,
    @Body() assignExecutorDto: AssignExecutorDto,
  ) {
    return this.arrangementsService.assignExecutor(willId, req.user.id, assignExecutorDto);
  }

  @Post('witnesses')
  @ApiOperation({ summary: 'Add a witness to a will' })
  @ApiResponse({ status: 201, description: 'Witness added successfully' })
  @ApiResponse({ status: 400, description: 'Witness not eligible' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async createWitness(
    @Request() req,
    @Param('willId') willId: string,
    @Body() createWitnessDto: CreateWitnessDto,
  ) {
    return this.arrangementsService.createWitness(willId, req.user.id, createWitnessDto);
  }

  @Get('witnesses')
  @ApiOperation({ summary: 'Get all witnesses for a will' })
  @ApiResponse({ status: 200, description: 'List of witnesses' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async findAllWitnesses(@Request() req, @Param('willId') willId: string) {
    return this.arrangementsService.findAllWitnesses(willId, req.user.id);
  }

  @Patch('witnesses/:witnessId')
  @ApiOperation({ summary: 'Update a witness' })
  @ApiResponse({ status: 200, description: 'Witness updated successfully' })
  @ApiResponse({ status: 404, description: 'Witness not found' })
  async updateWitness(
    @Request() req,
    @Param('willId') willId: string,
    @Param('witnessId') witnessId: string,
    @Body() updateWitnessDto: UpdateWitnessDto,
  ) {
    return this.arrangementsService.updateWitness(willId, witnessId, req.user.id, updateWitnessDto);
  }

  @Delete('witnesses/:witnessId')
  @ApiOperation({ summary: 'Delete a witness' })
  @ApiResponse({ status: 200, description: 'Witness deleted successfully' })
  @ApiResponse({ status: 404, description: 'Witness not found' })
  async removeWitness(
    @Request() req,
    @Param('willId') willId: string,
    @Param('witnessId') witnessId: string,
  ) {
    return this.arrangementsService.removeWitness(willId, witnessId, req.user.id);
  }

  @Post('signature')
  @ApiOperation({ summary: 'Upload or draw signature' })
  @ApiResponse({ status: 201, description: 'Signature uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Declaration must be accepted first' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async uploadSignature(
    @Request() req,
    @Param('willId') willId: string,
    @Body() uploadSignatureDto: UploadSignatureDto,
  ) {
    return this.arrangementsService.uploadSignature(willId, req.user.id, uploadSignatureDto);
  }

  @Post('consent-video')
  @ApiOperation({ summary: 'Upload consent video (optional)' })
  @ApiResponse({ status: 201, description: 'Consent video uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async uploadConsentVideo(
    @Request() req,
    @Param('willId') willId: string,
    @Body() uploadConsentVideoDto: UploadConsentVideoDto,
  ) {
    return this.arrangementsService.uploadConsentVideo(willId, req.user.id, uploadConsentVideoDto);
  }

  @Post('declaration')
  @ApiOperation({ summary: 'Accept capacity and free-will declaration' })
  @ApiResponse({ status: 201, description: 'Declaration accepted' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async acceptDeclaration(
    @Request() req,
    @Param('willId') willId: string,
    @Body() acceptDeclarationDto: AcceptDeclarationDto,
  ) {
    return this.arrangementsService.acceptDeclaration(willId, req.user.id, acceptDeclarationDto);
  }
}
