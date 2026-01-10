import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PremiumGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            return false; // Or throw Unauthorized
        }

        // Check DB for payment status
        const dbUser = await this.prisma.user.findUnique({ where: { id: user.id } });

        if (!dbUser || !dbUser.isPremium) {
            throw new HttpException({
                status: HttpStatus.PAYMENT_REQUIRED,
                error: 'Premium Upgrade Required',
                message: 'Please upgrade to Premium to generate your legal PDF.'
            }, HttpStatus.PAYMENT_REQUIRED);
        }
        return true;
    }
}
