import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './schemas/order.schema';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    create(dto: CreateOrderDto, req: any): Promise<import("./schemas/order.schema").OrderDocument>;
    findAll(status?: OrderStatus): Promise<import("./schemas/order.schema").OrderDocument[]>;
    findMyOrders(req: any): Promise<import("./schemas/order.schema").OrderDocument[]>;
    findOne(id: string): Promise<import("./schemas/order.schema").OrderDocument>;
    updateStatus(id: string, status: OrderStatus): Promise<import("./schemas/order.schema").OrderDocument>;
}
