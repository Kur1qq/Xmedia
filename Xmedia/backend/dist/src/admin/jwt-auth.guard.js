"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
exports.RolesGuard = RolesGuard;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const prisma_service_1 = require("../prisma.service");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);
function RolesGuard(...allowedRoles) {
    let _RolesGuard = class _RolesGuard extends (0, passport_1.AuthGuard)('jwt') {
        prisma;
        constructor(prisma) {
            super();
            this.prisma = prisma;
        }
        async canActivate(context) {
            await super.canActivate(context);
            const req = context.switchToHttp().getRequest();
            const { user } = req;
            if (!user)
                return false;
            if (allowedRoles.includes(user.role))
                return true;
            if (user.role === 'CUSTOM') {
                const admin = await this.prisma.admin.findUnique({
                    where: { id: user.id },
                    include: { customRole: true },
                });
                if (!admin || !admin.isActive || !admin.customRole)
                    return false;
                const permissions = admin.customRole.permissions;
                const cleanPath = req.path.replace(/^\/api/, '');
                const isAllowed = permissions.some(p => p === '/' ? cleanPath === '/' : cleanPath === p || cleanPath.startsWith(p + '/'));
                return isAllowed;
            }
            return allowedRoles.length === 0;
        }
    };
    _RolesGuard = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [prisma_service_1.PrismaService])
    ], _RolesGuard);
    return _RolesGuard;
}
//# sourceMappingURL=jwt-auth.guard.js.map