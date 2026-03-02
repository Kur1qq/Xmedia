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
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const prisma_module_1 = require("../prisma.module");
const admin_service_1 = require("./admin.service");
const admin_log_service_1 = require("./admin-log.service");
const admin_controller_1 = require("./admin.controller");
const jwt_strategy_1 = require("./jwt.strategy");
let AdminModule = class AdminModule {
    adminService;
    constructor(adminService) {
        this.adminService = adminService;
    }
    async onModuleInit() { await this.adminService.seed(); }
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: jwt_strategy_1.JWT_SECRET,
                signOptions: { expiresIn: jwt_strategy_1.JWT_EXPIRES_IN },
            }),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, admin_log_service_1.AdminLogService, jwt_strategy_1.JwtStrategy],
        exports: [admin_service_1.AdminService, admin_log_service_1.AdminLogService, jwt_1.JwtModule, jwt_strategy_1.JwtStrategy, passport_1.PassportModule],
    }),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminModule);
//# sourceMappingURL=admin.module.js.map