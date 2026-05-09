import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { Promotion, PromotionSchema } from './schemas/promotion.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Promotion.name, schema: PromotionSchema }])],
  providers: [PromotionsService],
  controllers: [PromotionsController],
})
export class PromotionsModule {}
