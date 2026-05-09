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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const core_1 = require("@nestjs/core");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    getMetrics() {
        return this.dashboardService.getMetrics();
    }
    getSalesChart(days) {
        return this.dashboardService.getSalesChart(days ? parseInt(days) : 7);
    }
    getTopProducts(limit) {
        return this.dashboardService.getTopProducts(limit ? parseInt(limit) : 5);
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('metrics'),
    (0, common_1.UseGuards)(new auth_guard_1.AdminGuard(new core_1.Reflector())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('sales-chart'),
    (0, common_1.UseGuards)(new auth_guard_1.AdminGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getSalesChart", null);
__decorate([
    (0, common_1.Get)('top-products'),
    (0, common_1.UseGuards)(new auth_guard_1.AdminGuard(new core_1.Reflector())),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DashboardController.prototype, "getTopProducts", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map