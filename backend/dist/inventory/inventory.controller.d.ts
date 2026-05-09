import { InventoryService } from './inventory.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
export declare class InventoryController {
    private inventoryService;
    constructor(inventoryService: InventoryService);
    findAll(product?: string): Promise<import("./schemas/inventory-movement.schema").InventoryMovementDocument[]>;
    getLowStock(): Promise<import("../products/schemas/product.schema").ProductDocument[]>;
    createMovement(dto: CreateInventoryMovementDto): Promise<import("./schemas/inventory-movement.schema").InventoryMovementDocument>;
}
