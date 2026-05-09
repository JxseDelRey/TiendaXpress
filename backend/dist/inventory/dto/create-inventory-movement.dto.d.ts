import { MovementType } from '../schemas/inventory-movement.schema';
export declare class CreateInventoryMovementDto {
    product: string;
    type: MovementType;
    quantity: number;
    reason?: string;
}
