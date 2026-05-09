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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionSchema = exports.Promotion = exports.DiscountType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "porcentaje";
    DiscountType["FIXED"] = "monto_fijo";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
let Promotion = class Promotion {
    name;
    description;
    discountType;
    discountValue;
    applicableProducts;
    applicableCategories;
    startDate;
    endDate;
    isActive;
    minPurchaseAmount;
};
exports.Promotion = Promotion;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Promotion.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Promotion.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: DiscountType, required: true }),
    __metadata("design:type", String)
], Promotion.prototype, "discountType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Promotion.prototype, "discountValue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Product', default: [] }),
    __metadata("design:type", Array)
], Promotion.prototype, "applicableProducts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [mongoose_2.Types.ObjectId], ref: 'Category', default: [] }),
    __metadata("design:type", Array)
], Promotion.prototype, "applicableCategories", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Promotion.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Promotion.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Promotion.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Promotion.prototype, "minPurchaseAmount", void 0);
exports.Promotion = Promotion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Promotion);
exports.PromotionSchema = mongoose_1.SchemaFactory.createForClass(Promotion);
//# sourceMappingURL=promotion.schema.js.map