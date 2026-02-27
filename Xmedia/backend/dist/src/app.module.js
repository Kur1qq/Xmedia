"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma.module");
const health_controller_1 = require("./health.controller");
const users_module_1 = require("./users/users.module");
const bookings_module_1 = require("./bookings/bookings.module");
const equipment_module_1 = require("./equipment/equipment.module");
const category_module_1 = require("./category/category.module");
const upload_module_1 = require("./upload/upload.module");
const studio_module_1 = require("./studio/studio.module");
const service_module_1 = require("./service/service.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const live_service_module_1 = require("./live-service/live-service.module");
const photographer_service_module_1 = require("./photographer-service/photographer-service.module");
const photographer_type_module_1 = require("./photographer-type/photographer-type.module");
const edit_service_module_1 = require("./edit-service/edit-service.module");
const admin_module_1 = require("./admin/admin.module");
const log_module_1 = require("./log/log.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            log_module_1.LogModule,
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            bookings_module_1.BookingsModule,
            equipment_module_1.EquipmentModule,
            category_module_1.CategoryModule,
            upload_module_1.UploadModule,
            studio_module_1.StudioModule,
            service_module_1.ServiceModule,
            dashboard_module_1.DashboardModule,
            live_service_module_1.LiveServiceModule,
            photographer_service_module_1.PhotographerServiceModule,
            photographer_type_module_1.PhotographerTypeModule,
            edit_service_module_1.EditServiceModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map