import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0, default: 0 })
  discountPercent: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  stock: number;

  @Prop({ default: 5 })
  lowStockAlert: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  soldCount: number;

  @Prop({ default: 0 })
  costPrice: number;

  @Prop()
  barcode?: string;

  @Prop()
  unit?: string; // 'kg', 'unidad', 'litro'

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Índice de búsqueda de texto
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
