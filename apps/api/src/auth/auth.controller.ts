import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SendOtpDto, VerifyOtpDto, OAuthCallbackDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto.phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP and get JWT token' })
  @ApiResponse({ status: 200, description: 'OTP verified, token returned' })
  @ApiResponse({ status: 401, description: 'Invalid OTP' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.phone, dto.otp);
  }

  @Post('oauth/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OAuth callback (Google/Facebook)' })
  @ApiResponse({ status: 200, description: 'OAuth successful, token returned' })
  async oauthCallback(@Body() dto: OAuthCallbackDto) {
    return this.authService.oauthCallback(dto.provider, dto.profile);
  }

  @Post('dev/mock-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Development: Mock login (bypasses OTP)' })
  @ApiResponse({ status: 200, description: 'Mock login successful, token returned' })
  @ApiResponse({ status: 401, description: 'Invalid mock credentials or production mode' })
  async mockLogin(@Body() dto: { phone: string; otp: string }) {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Mock login not allowed in production');
    }

    // Only allow specific mock credentials
    if (dto.phone === '7042063370' && dto.otp === '278823') {
      return this.authService.mockLogin(dto.phone);
    }

    throw new UnauthorizedException('Invalid mock credentials');
  }
}
