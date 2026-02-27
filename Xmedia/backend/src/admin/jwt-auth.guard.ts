import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }

// Role check: pass allowedRoles = ['SUPER_ADMIN'] etc.
export function RolesGuard(...allowedRoles: string[]) {
    @Injectable()
    class _RolesGuard extends AuthGuard('jwt') {
        async canActivate(context: ExecutionContext): Promise<boolean> {
            await super.canActivate(context);
            const { user } = context.switchToHttp().getRequest();
            return allowedRoles.length === 0 || allowedRoles.includes(user?.role);
        }
    }
    return _RolesGuard;
}
