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
exports.InventoryMovementSchema = exports.InventoryMovement = exports.MovementType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MovementType;
(function (MovementType) {
    MovementType["IN"] = "entrada";
    MovementType["OUT"] = "salida";
    MovementType["ADJUSTMENT"] = "ajuste";
})(MovementType || (exports.MovementType = MovementType = {}));
let InventoryMovement = class InventoryMovement {
    product;
    productName;
    type;
    quantity;
    previousStock;
    newStock;
    reason;
    createdBy;
};
exports.InventoryMovement = InventoryMovement;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Product', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryMovement.prototype, "product", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "productName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ enum: MovementType, required: true }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryMovement.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryMovement.prototype, "previousStock", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], InventoryMovement.prototype, "newStock", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], InventoryMovement.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], InventoryMovement.prototype, "createdBy", void 0);
exports.InventoryMovement = InventoryMovement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], InventoryMovement);
exports.InventoryMovementSchema = mongoose_1.SchemaFactory.createForClass(InventoryMovement);
//# sourceMappingURL=inventory-movement.schema.js.map