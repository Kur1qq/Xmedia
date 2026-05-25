import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }

// Role check: pass allowedRoles = ['SUPER_ADMIN'] etc.
export function RolesGuard(...allowedRoles: string[]) {
    @Injectable()
    class _RolesGuard extends AuthGuard('jwt') {
        constructor(public prisma: PrismaService) {
            super();
        }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            await super.canActivate(context);
            const req = context.switchToHttp().getRequest();
            const { user } = req;

            if (!user) return false;

            // If directly allowed, proceed
            if (allowedRoles.includes(user.role)) return true;

            // If the user has a CUSTOM role, check their fine-grained permissions
            if (user.role === 'CUSTOM') {
                const admin = await this.prisma.admin.findUnique({
                    where: { id: user.id },
                    include: { customRole: true },
                });

                if (!admin || !admin.isActive || !admin.customRole) return false;

                const permissions = admin.customRole.permissions as string[];
                const cleanPath = req.path.replace(/^\/api/, '');

                const isAllowed = permissions.some(p =>
                    p === '/' ? cleanPath === '/' : cleanPath === p || cleanPath.startsWith(p + '/')
                );

                return isAllowed;
            }

            return allowedRoles.length === 0;
        }
    }
    return _RolesGuard;
}
