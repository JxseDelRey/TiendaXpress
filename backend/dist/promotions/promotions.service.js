"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = exports.CreatePromotionDto = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const promotion_schema_1 = require("./schemas/promotion.schema");
const class_validator_1 = require("class-validator");
const promotion_schema_2 = require("./schemas/promotion.schema");
const class_transformer_1 = require("class-transformer");
class CreatePromotionDto {
    name;
    description;
    discountType;
    discountValue;
    applicableProducts;
    applicableCategories;
    startDate;
    endDate;
    minPurchaseAmount;
}
exports.CreatePromotionDto = CreatePromotionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_schema_2.DiscountType),
    __metadata("design:type", String)
], CreatePromotionDto.prototype, "discountType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "discountValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePromotionDto.prototype, "applicableProducts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePromotionDto.prototype, "applicableCategories", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePromotionDto.prototype, "startDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreatePromotionDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePromotionDto.prototype, "minPurchaseAmount", void 0);
let PromotionsService = class PromotionsService {
    promoModel;
    constructor(promoModel) {
        this.promoModel = promoModel;
    }
    async create(dto) {
        return new this.promoModel(dto).save();
    }
    async findAll(activeOnly = false) {
        const filter = {};
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
    async update(id, dto) {
        return this.promoModel.findByIdAndUpdate(id, dto, { new: true });
    }
    async remove(id) {
        await this.promoModel.findByIdAndUpdate(id, { isActive: false });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(promotion_schema_1.Promotion.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map