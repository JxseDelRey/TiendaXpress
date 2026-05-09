import { Model } from 'mongoose';
import { OrderDocument, OrderStatus } from './schemas/order.schema';
import { ProductDocument } from '../products/schemas/product.schema';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { HttpService } from '@nestjs/axios';
export declare class OrdersService {
    private orderModel;
    private productModel;
    private usersService;
    private httpService;
    constructor(orderModel: Model<OrderDocument>, productModel: Model<ProductDocument>, usersService: UsersService, httpService: HttpService);
    create(dto: CreateOrderDto, customerId?: string): Promise<OrderDocument>;
    findAll(status?: OrderStatus): Promise<OrderDocument[]>;
    findMyOrders(customerId: string): Promise<OrderDocument[]>;
    findById(id: string): Promise<OrderDocument>;
    updateStatus(id: string, status: OrderStatus): Promise<OrderDocument>;
    sendToMake(order: OrderDocument, isRegistered?: boolean): Promise<void>;
}
