import { Model } from 'mongoose';
import { PromotionDocument } from './schemas/promotion.schema';
import { DiscountType } from './schemas/promotion.schema';
export declare class CreatePromotionDto {
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    applicableProducts?: string[];
    applicableCategories?: string[];
    startDate: Date;
    endDate: Date;
    minPurchaseAmount?: number;
}
export declare class PromotionsService {
    private promoModel;
    constructor(promoModel: Model<PromotionDocument>);
    create(dto: CreatePromotionDto): Promise<PromotionDocument>;
    findAll(activeOnly?: boolean): Promise<PromotionDocument[]>;
    update(id: string, dto: Partial<CreatePromotionDto>): Promise<PromotionDocument | null>;
    remove(id: string): Promise<void>;
}
