import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getMetrics(): Promise<{
        today: {
            orders: number;
            revenue: number;
        };
        week: {
            orders: number;
            revenue: number;
        };
        month: {
            orders: number;
            revenue: number;
        };
        inventory: {
            totalProducts: number;
            lowStockCount: number;
        };
        totalOrders: number;
    }>;
    getSalesChart(days?: string): Promise<any[]>;
    getTopProducts(limit?: string): Promise<(import("mongoose").Document<unknown, {}, import("../products/schemas/product.schema").ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../products/schemas/product.schema").Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
