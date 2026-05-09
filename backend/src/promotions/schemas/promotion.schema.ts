import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromotionDocument = Promotion & Document;

export enum DiscountType {
  PERCENTAGE = 'porcentaje',
  FIXED = 'monto_fijo',
}

@Schema({ timestamps: true })
export class Promotion {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ enum: DiscountType, required: true })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  applicableProducts: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  applicableCategories: Types.ObjectId[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0, min: 0 })
  minPurchaseAmount: number;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
