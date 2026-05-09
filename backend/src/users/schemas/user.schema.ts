import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  phone?: string;

  @Prop({ default: 0 })
  totalPurchases: number;

  @Prop({ default: 0 })
  loyaltyPoints: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
