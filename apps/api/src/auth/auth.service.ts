import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async sendOtp(phone: string) {
    // Mock OTP for MVP - generate 6 digit code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, integrate with SMS provider (Twilio, MSG91, etc.)
    // For MVP, we'll just log it
    console.log(`OTP for ${phone}: ${otp}`);
    
    // Store OTP in memory/cache (use Redis in production)
    // For MVP, return success
    return {
      success: true,
      message: 'OTP sent successfully',
      // In development, include OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  }

  async verifyOtp(phone: string, otp: string) {
    // Mock verification for MVP
    // In production, verify against stored OTP in Redis
    
    // For MVP, accept any 6-digit code
    if (!/^\d{6}$/.test(otp)) {
      throw new UnauthorizedException('Invalid OTP format');
    }

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await this.usersService.create({
        phone,
      });
    }

    // Generate JWT token
    const payload = { sub: user.id, phone: user.phone };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async oauthCallback(provider: string, profile: any) {
    // OAuth callback handler (Google/Facebook)
    // For MVP, create or find user by email
    const email = profile.email;
    
    if (!email) {
      throw new UnauthorizedException('Email not provided by OAuth provider');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.usersService.create({
        email,
        fullName: profile.name || profile.displayName,
      });
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
