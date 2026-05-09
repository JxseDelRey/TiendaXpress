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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("../orders/schemas/order.schema");
const product_schema_1 = require("../products/schemas/product.schema");
let DashboardService = class DashboardService {
    orderModel;
    productModel;
    constructor(orderModel, productModel) {
        this.orderModel = orderModel;
        this.productModel = productModel;
    }
    async getMetrics() {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        const monthStart = new Date(now);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const todayOrders = await this.orderModel.find({
            createdAt: { $gte: todayStart },
            status: { $ne: 'cancelled' },
        });
        const weekOrders = await this.orderModel.find({
            createdAt: { $gte: weekStart },
            status: { $ne: 'cancelled' },
        });
        const monthOrders = await this.orderModel.find({
            createdAt: { $gte: monthStart },
            status: { $ne: 'cancelled' },
        });
        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
        const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
        const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);
        const lowStockCount = await this.productModel.countDocuments({
            isActive: true,
            $expr: { $lte: ['$stock', '$lowStockAlert'] },
        });
        const totalProducts = await this.productModel.countDocuments({
            isActive: true,
        });
        const totalOrders = await this.orderModel.countDocuments();
        return {
            today: {
                orders: todayOrders.length,
                revenue: todayRevenue,
            },
            week: {
                orders: weekOrders.length,
                revenue: weekRevenue,
            },
            month: {
                orders: monthOrders.length,
                revenue: monthRevenue,
            },
            inventory: {
                totalProducts,
                lowStockCount,
            },
            totalOrders,
        };
    }
    async getSalesChart(days = 7) {
        const result = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            const orders = await this.orderModel.find({
                createdAt: { $gte: date, $lt: nextDate },
                status: { $ne: 'cancelled' },
            });
            const revenue = orders.reduce((sum, o) => sum + o.total, 0);
            result.push({
                date: date.toLocaleDateString('es-CO', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                }),
                orders: orders.length,
                revenue,
            });
        }
        return result;
    }
    async getTopProducts(limit = 5) {
        return this.productModel
            .find({ isActive: true })
            .sort({ soldCount: -1 })
            .limit(limit)
            .select('name soldCount price category images')
            .populate('category', 'name icon')
            .exec();
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map