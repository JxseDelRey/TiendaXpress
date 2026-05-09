import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { MovementType } from '../schemas/inventory-movement.schema';

export class CreateInventoryMovementDto {
  @IsMongoId()
  product: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
