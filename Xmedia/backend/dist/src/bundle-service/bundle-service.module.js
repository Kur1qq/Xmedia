"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleServiceModule = void 0;
const common_1 = require("@nestjs/common");
const bundle_service_controller_1 = require("./bundle-service.controller");
const bundle_service_service_1 = require("./bundle-service.service");
let BundleServiceModule = class BundleServiceModule {
};
exports.BundleServiceModule = BundleServiceModule;
exports.BundleServiceModule = BundleServiceModule = __decorate([
    (0, common_1.Module)({
        controllers: [bundle_service_controller_1.BundleServiceController],
        providers: [bundle_service_service_1.BundleServiceService]
    })
], BundleServiceModule);
//# sourceMappingURL=bundle-service.module.js.map