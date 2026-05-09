import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryMovementDocument = InventoryMovement & Document;

export enum MovementType {
  IN = 'entrada',
  OUT = 'salida',
  ADJUSTMENT = 'ajuste',
}

@Schema({ timestamps: true })
export class InventoryMovement {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ enum: MovementType, required: true })
  type: MovementType;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  previousStock: number;

  @Prop({ required: true })
  newStock: number;

  @Prop()
  reason?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const InventoryMovementSchema =
  SchemaFactory.createForClass(InventoryMovement);
