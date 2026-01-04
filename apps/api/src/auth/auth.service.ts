import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../common/redis.service';

@Injectable()
export class AuthService {
  private readonly OTP_EXPIRY_SECONDS = 300; // 5 minutes
  private readonly OTP_RATE_LIMIT_SECONDS = 60; // 1 minute between requests
  private readonly MAX_OTP_ATTEMPTS = 3;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async sendOtp(phone: string) {
    // Validate phone format (basic validation)
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Rate limiting: Check if OTP was sent recently
    const rateLimitKey = `otp:rate:${phone}`;
    const rateLimitExists = await this.redisService.exists(rateLimitKey);
    if (rateLimitExists) {
      throw new BadRequestException('Please wait before requesting another OTP');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP in Redis with expiry
    const otpKey = `otp:${phone}`;
    await this.redisService.set(otpKey, otp, this.OTP_EXPIRY_SECONDS);
    
    // Set rate limit
    await this.redisService.set(rateLimitKey, '1', this.OTP_RATE_LIMIT_SECONDS);
    
    // Reset attempt counter
    const attemptsKey = `otp:attempts:${phone}`;
    await this.redisService.del(attemptsKey);

    // In production, integrate with SMS provider (Twilio, MSG91, etc.)
    // For now, log it (in development, we'll return it in response)
    console.log(`OTP for ${phone}: ${otp}`);
    
    // TODO: Integrate with SMS service
    // await this.smsService.sendOtp(phone, otp);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      // In development, include OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  }

  async verifyOtp(phone: string, otp: string) {
    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      throw new UnauthorizedException('Invalid OTP format');
    }

    // Check attempt limit
    const attemptsKey = `otp:attempts:${phone}`;
    const attempts = await this.redisService.get(attemptsKey);
    const attemptCount = attempts ? parseInt(attempts, 10) : 0;
    
    if (attemptCount >= this.MAX_OTP_ATTEMPTS) {
      throw new UnauthorizedException('Too many failed attempts. Please request a new OTP.');
    }

    // Get stored OTP from Redis
    const otpKey = `otp:${phone}`;
    const storedOtp = await this.redisService.get(otpKey);
    
    if (!storedOtp) {
      await this.redisService.increment(attemptsKey);
      await this.redisService.expire(attemptsKey, this.OTP_EXPIRY_SECONDS);
      throw new UnauthorizedException('OTP expired or invalid. Please request a new one.');
    }

    // Verify OTP
    if (storedOtp !== otp) {
      await this.redisService.increment(attemptsKey);
      await this.redisService.expire(attemptsKey, this.OTP_EXPIRY_SECONDS);
      throw new UnauthorizedException('Invalid OTP');
    }

    // OTP verified successfully - delete it and attempts counter
    await this.redisService.del(otpKey);
    await this.redisService.del(attemptsKey);

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
