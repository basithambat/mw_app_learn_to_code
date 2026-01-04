import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pdf')
@Controller('wills/:willId/pdf')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF for a will' })
  @ApiResponse({ status: 201, description: 'PDF generated successfully' })
  @ApiResponse({ status: 400, description: 'Required components missing' })
  @ApiResponse({ status: 404, description: 'Will not found' })
  async generatePdf(@Request() req, @Param('willId') willId: string) {
    return this.pdfService.generatePdf(willId, req.user.id);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get the latest PDF version for a will' })
  @ApiResponse({ status: 200, description: 'Latest PDF version' })
  @ApiResponse({ status: 404, description: 'PDF not found' })
  async getLatestPdf(@Request() req, @Param('willId') willId: string) {
    return this.pdfService.getLatestPdf(willId, req.user.id);
  }
}
