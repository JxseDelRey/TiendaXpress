import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ required: true, min: 0 })
  subtotal: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  customer?: Types.ObjectId;

  @Prop()
  customerName?: string;

  @Prop()
  customerDocument?: string;

  @Prop()
  customerPhone?: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop()
  notes?: string;

  @Prop({ default: 'efectivo' }) // 'efectivo', 'tarjeta', 'transferencia'
  paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
