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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const inventory_movement_schema_1 = require("./schemas/inventory-movement.schema");
const product_schema_1 = require("../products/schemas/product.schema");
let InventoryService = class InventoryService {
    movementModel;
    productModel;
    constructor(movementModel, productModel) {
        this.movementModel = movementModel;
        this.productModel = productModel;
    }
    async createMovement(dto, userId) {
        const product = await this.productModel.findById(dto.product);
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        let newStock = product.stock;
        if (dto.type === inventory_movement_schema_1.MovementType.IN) {
            newStock += dto.quantity;
        }
        else if (dto.type === inventory_movement_schema_1.MovementType.OUT) {
            if (product.stock < dto.quantity) {
                throw new common_1.BadRequestException('Stock insuficiente');
            }
            newStock -= dto.quantity;
        }
        else {
            newStock = dto.quantity;
        }
        const movement = new this.movementModel({
            product: dto.product,
            productName: product.name,
            type: dto.type,
            quantity: dto.quantity,
            previousStock: product.stock,
            newStock,
            reason: dto.reason,
            createdBy: userId,
        });
        await this.productModel.findByIdAndUpdate(dto.product, {
            stock: newStock,
        });
        return movement.save();
    }
    async findAll(productId) {
        const filter = {};
        if (productId)
            filter.product = productId;
        return this.movementModel
            .find(filter)
            .populate('product', 'name')
            .sort({ createdAt: -1 })
            .limit(100)
            .exec();
    }
    async getLowStockProducts() {
        return this.productModel
            .find({
            isActive: true,
            $expr: { $lte: ['$stock', '$lowStockAlert'] },
        })
            .populate('category', 'name icon')
            .exec();
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(inventory_movement_schema_1.InventoryMovement.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map