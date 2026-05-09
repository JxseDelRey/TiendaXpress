import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getMetrics() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Ventas de hoy
    const todayOrders = await this.orderModel.find({
      createdAt: { $gte: todayStart },
      status: { $ne: 'cancelled' },
    });

    // Ventas de la semana
    const weekOrders = await this.orderModel.find({
      createdAt: { $gte: weekStart },
      status: { $ne: 'cancelled' },
    });

    // Ventas del mes
    const monthOrders = await this.orderModel.find({
      createdAt: { $gte: monthStart },
      status: { $ne: 'cancelled' },
    });

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + o.total, 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0);

    // Productos con bajo stock
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
    const result: any[] = [];
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
}
