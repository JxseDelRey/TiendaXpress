import { Model } from 'mongoose';
import { InventoryMovementDocument } from './schemas/inventory-movement.schema';
import { ProductDocument } from '../products/schemas/product.schema';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
export declare class InventoryService {
    private movementModel;
    private productModel;
    constructor(movementModel: Model<InventoryMovementDocument>, productModel: Model<ProductDocument>);
    createMovement(dto: CreateInventoryMovementDto, userId?: string): Promise<InventoryMovementDocument>;
    findAll(productId?: string): Promise<InventoryMovementDocument[]>;
    getLowStockProducts(): Promise<ProductDocument[]>;
}
