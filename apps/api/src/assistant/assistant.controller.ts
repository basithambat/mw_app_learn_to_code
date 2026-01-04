import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssistantService } from './assistant.service';
import { QueryDto, EscalateDto } from './dto/assistant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('assistant')
@Controller('assistant')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('query')
  @ApiOperation({ summary: 'Query the legal assistant' })
  @ApiResponse({ status: 200, description: 'Assistant response' })
  async query(@Request() req, @Body() queryDto: QueryDto) {
    return this.assistantService.query(req.user.id, queryDto);
  }

  @Post('escalate')
  @ApiOperation({ summary: 'Escalate to human legal aid' })
  @ApiResponse({ status: 201, description: 'Legal aid request created' })
  async escalate(@Request() req, @Body() escalateDto: EscalateDto) {
    return this.assistantService.escalate(req.user.id, escalateDto);
  }
}
