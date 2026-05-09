import { PromotionsService, CreatePromotionDto } from './promotions.service';
export declare class PromotionsController {
    private promotionsService;
    constructor(promotionsService: PromotionsService);
    findAll(active?: string): Promise<import("./schemas/promotion.schema").PromotionDocument[]>;
    create(dto: CreatePromotionDto): Promise<import("./schemas/promotion.schema").PromotionDocument>;
    update(id: string, dto: Partial<CreatePromotionDto>): Promise<import("./schemas/promotion.schema").PromotionDocument | null>;
    remove(id: string): Promise<void>;
}
