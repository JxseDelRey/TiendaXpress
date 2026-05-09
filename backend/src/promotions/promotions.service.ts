import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Promotion, PromotionDocument } from './schemas/promotion.schema';
import {
  IsString, IsEnum, IsNumber, IsOptional, IsArray, IsDate, Min,
} from 'class-validator';
import { DiscountType } from './schemas/promotion.schema';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(DiscountType) discountType: DiscountType;
  @IsNumber() @Min(0) discountValue: number;
  @IsOptional() @IsArray() applicableProducts?: string[];
  @IsOptional() @IsArray() applicableCategories?: string[];
  @Type(() => Date) startDate: Date;
  @Type(() => Date) endDate: Date;
  @IsOptional() @IsNumber() @Min(0) minPurchaseAmount?: number;
}

@Injectable()
export class PromotionsService {
  constructor(
    @InjectModel(Promotion.name) private promoModel: Model<PromotionDocument>,
  ) {}

  async create(dto: CreatePromotionDto): Promise<PromotionDocument> {
    return new this.promoModel(dto).save();
  }

  async findAll(activeOnly = false): Promise<PromotionDocument[]> {
    const filter: any = {};
    if (activeOnly) {
      const now = new Date();
      filter.isActive = true;
      filter.startDate = { $lte: now };
      filter.endDate = { $gte: now };
    }
    return this.promoModel
      .find(filter)
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name icon')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, dto: Partial<CreatePromotionDto>): Promise<PromotionDocument | null> {
    return this.promoModel.findByIdAndUpdate(id, dto, { new: true });
  }

  async remove(id: string): Promise<void> {
    await this.promoModel.findByIdAndUpdate(id, { isActive: false });
  }
}
