import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryMovement,
  InventoryMovementDocument,
  MovementType,
} from './schemas/inventory-movement.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryMovement.name)
    private movementModel: Model<InventoryMovementDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createMovement(
    dto: CreateInventoryMovementDto,
    userId?: string,
  ): Promise<InventoryMovementDocument> {
    const product = await this.productModel.findById(dto.product);
    if (!product) throw new NotFoundException('Producto no encontrado');

    let newStock = product.stock;
    if (dto.type === MovementType.IN) {
      newStock += dto.quantity;
    } else if (dto.type === MovementType.OUT) {
      if (product.stock < dto.quantity) {
        throw new BadRequestException('Stock insuficiente');
      }
      newStock -= dto.quantity;
    } else {
      // Ajuste directo
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

  async findAll(productId?: string): Promise<InventoryMovementDocument[]> {
    const filter: any = {};
    if (productId) filter.product = productId;
    return this.movementModel
      .find(filter)
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
  }

  async getLowStockProducts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockAlert'] },
      })
      .populate('category', 'name icon')
      .exec();
  }
}
