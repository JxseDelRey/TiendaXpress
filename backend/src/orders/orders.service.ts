import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';

// 🔥 NUEVOS IMPORTS
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private usersService: UsersService,
    private httpService: HttpService, // 🔥 INYECCIÓN
  ) {}

  async create(
    dto: CreateOrderDto,
    customerId?: string,
  ): Promise<OrderDocument> {
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.product);
      if (!product || !product.isActive) {
        throw new NotFoundException(
          `Producto ${item.product} no encontrado o no disponible`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
        );
      }

      const discountMultiplier = 1 - (product.discountPercent || 0) / 100;
      const unitPrice = product.price * discountMultiplier;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: new Types.ObjectId(item.product),
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        subtotal: itemSubtotal,
      });

      // Descontar stock y actualizar ventas
      await this.productModel.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    const order = new this.orderModel({
      customer: customerId ? new Types.ObjectId(customerId) : undefined,
      customerName: dto.customerName,
      customerDocument: dto.customerDocument,
      customerPhone: dto.customerPhone,
      items: orderItems,
      subtotal,
      total: subtotal,
      notes: dto.notes,
      paymentMethod: dto.paymentMethod || 'efectivo',
    });

    const savedOrder = await order.save();

    const isRegistered = !!customerId;

    // 🔥 ENVIAR A MAKE (NO BLOQUEANTE)
    this.sendToMake(savedOrder, isRegistered);

    // Actualizar lealtad del cliente
    if (customerId) {
      await this.usersService.updateLoyalty(customerId, subtotal);
    }

    return savedOrder;
  }

  async findAll(status?: OrderStatus): Promise<OrderDocument[]> {
    const filter: any = {};
    if (status) filter.status = status;
    return this.orderModel
      .find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMyOrders(customerId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({ customer: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findById(id)
      .populate('customer', 'name email phone')
      .exec();
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  // 🔥 FUNCIÓN PARA MAKE
  async sendToMake(order: OrderDocument, isRegistered: boolean = false) {
    try {
      // Extraer email embebido en el campo notes (formato: "📧 Email: correo@dominio.com")
      const emailMatch = order.notes?.match(
        /[Ee]mail:\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/,
      );
      const emailExtraido = emailMatch ? emailMatch[1] : null;

      await firstValueFrom(
        this.httpService.post('https://hook.us2.make.com/tdxxbmru5v2pghqqe5cniu7m533qukxi', {
          id: order._id,
          cliente: {
            nombre:    order.customerName,
            telefono:  order.customerPhone,
            email:     emailExtraido,            // ✅ Campo dedicado para Make
            isRegistered,                        // ✅ Indicador de si el cliente tiene cuenta
            notas:     order.notes,
          },
          productos: order.items.map((item) => ({
            nombre:   item.productName,
            cantidad: item.quantity,
            precio:   item.unitPrice,
          })),
          total:       order.total,
          metodoPago:  order.paymentMethod,
          fecha:       new Date(),
        }),
      );

      console.log(
        `✅ Pedido ${order._id} enviado a Make. Email: ${emailExtraido ?? 'no proporcionado'}`,
      );
    } catch (error) {
      console.error('❌ Error enviando a Make:', error.message);
    }
  }
}