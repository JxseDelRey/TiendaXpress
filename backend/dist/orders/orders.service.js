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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const product_schema_1 = require("../products/schemas/product.schema");
const users_service_1 = require("../users/users.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let OrdersService = class OrdersService {
    orderModel;
    productModel;
    usersService;
    httpService;
    constructor(orderModel, productModel, usersService, httpService) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.usersService = usersService;
        this.httpService = httpService;
    }
    async create(dto, customerId) {
        const orderItems = [];
        let subtotal = 0;
        for (const item of dto.items) {
            const product = await this.productModel.findById(item.product);
            if (!product || !product.isActive) {
                throw new common_1.NotFoundException(`Producto ${item.product} no encontrado o no disponible`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
            }
            const discountMultiplier = 1 - (product.discountPercent || 0) / 100;
            const unitPrice = product.price * discountMultiplier;
            const itemSubtotal = unitPrice * item.quantity;
            subtotal += itemSubtotal;
            orderItems.push({
                product: new mongoose_2.Types.ObjectId(item.product),
                productName: product.name,
                quantity: item.quantity,
                unitPrice,
                subtotal: itemSubtotal,
            });
            await this.productModel.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity, soldCount: item.quantity },
            });
        }
        const order = new this.orderModel({
            customer: customerId ? new mongoose_2.Types.ObjectId(customerId) : undefined,
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
        this.sendToMake(savedOrder, isRegistered);
        if (customerId) {
            await this.usersService.updateLoyalty(customerId, subtotal);
        }
        return savedOrder;
    }
    async findAll(status) {
        const filter = {};
        if (status)
            filter.status = status;
        return this.orderModel
            .find(filter)
            .populate('customer', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findMyOrders(customerId) {
        return this.orderModel
            .find({ customer: new mongoose_2.Types.ObjectId(customerId) })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findById(id) {
        const order = await this.orderModel
            .findById(id)
            .populate('customer', 'name email phone')
            .exec();
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return order;
    }
    async updateStatus(id, status) {
        const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!order)
            throw new common_1.NotFoundException('Pedido no encontrado');
        return order;
    }
    async sendToMake(order, isRegistered = false) {
        try {
            const emailMatch = order.notes?.match(/[Ee]mail:\s*([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
            const emailExtraido = emailMatch ? emailMatch[1] : null;
            await (0, rxjs_1.firstValueFrom)(this.httpService.post('https://hook.us2.make.com/tdxxbmru5v2pghqqe5cniu7m533qukxi', {
                id: order._id,
                cliente: {
                    nombre: order.customerName,
                    telefono: order.customerPhone,
                    email: emailExtraido,
                    isRegistered,
                    notas: order.notes,
                },
                productos: order.items.map((item) => ({
                    nombre: item.productName,
                    cantidad: item.quantity,
                    precio: item.unitPrice,
                })),
                total: order.total,
                metodoPago: order.paymentMethod,
                fecha: new Date(),
            }));
            console.log(`✅ Pedido ${order._id} enviado a Make. Email: ${emailExtraido ?? 'no proporcionado'}`);
        }
        catch (error) {
            console.error('❌ Error enviando a Make:', error.message);
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService,
        axios_1.HttpService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map