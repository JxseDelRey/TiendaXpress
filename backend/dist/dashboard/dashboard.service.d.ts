import { Model } from 'mongoose';
import { OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
export declare class DashboardService {
    private orderModel;
    private productModel;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>);
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
    getSalesChart(days?: number): Promise<any[]>;
    getTopProducts(limit?: number): Promise<(import("mongoose").Document<unknown, {}, ProductDocument, {}, import("mongoose").DefaultSchemaOptions> & Product & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
