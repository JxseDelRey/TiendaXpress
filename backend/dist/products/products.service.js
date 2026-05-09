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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
let ProductsService = class ProductsService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(createProductDto) {
        const product = new this.productModel(createProductDto);
        return product.save();
    }
    async findAll(query) {
        const { search, category, featured, page = 1, limit = 20, minPrice, maxPrice, } = query;
        const filter = { isActive: true };
        if (search) {
            filter.$text = { $search: search };
        }
        if (category)
            filter.category = category;
        if (featured !== undefined)
            filter.isFeatured = featured;
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined)
                filter.price.$gte = minPrice;
            if (maxPrice !== undefined)
                filter.price.$lte = maxPrice;
        }
        const skip = (page - 1) * limit;
        const total = await this.productModel.countDocuments(filter);
        const products = await this.productModel
            .find(filter)
            .populate('category', 'name icon color')
            .sort({ isFeatured: -1, soldCount: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        return { products, total, pages: Math.ceil(total / limit) };
    }
    async findFeatured() {
        return this.productModel
            .find({ isActive: true, isFeatured: true })
            .populate('category', 'name icon color')
            .limit(8)
            .exec();
    }
    async findById(id) {
        const product = await this.productModel
            .findById(id)
            .populate('category', 'name icon color')
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return product;
    }
    async findRelated(productId, limit = 4) {
        const product = await this.findById(productId);
        return this.productModel
            .find({
            _id: { $ne: productId },
            category: product.category,
            isActive: true,
        })
            .populate('category', 'name icon color')
            .limit(limit)
            .exec();
    }
    async update(id, updateData) {
        const product = await this.productModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .populate('category', 'name icon color')
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return product;
    }
    async remove(id) {
        const result = await this.productModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!result)
            throw new common_1.NotFoundException('Producto no encontrado');
    }
    async updateStock(id, newStock) {
        const product = await this.productModel
            .findByIdAndUpdate(id, { stock: newStock }, { new: true })
            .exec();
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return product;
    }
    async getLowStockProducts() {
        return this.productModel
            .find({
            isActive: true,
            $expr: { $lte: ['$stock', '$lowStockAlert'] },
        })
            .populate('category', 'name icon color')
            .exec();
    }
    async getTopSelling(limit = 5) {
        return this.productModel
            .find({ isActive: true })
            .sort({ soldCount: -1 })
            .limit(limit)
            .populate('category', 'name icon color')
            .exec();
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map