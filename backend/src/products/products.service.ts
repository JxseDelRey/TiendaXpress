import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { PartialType } from '@nestjs/mapped-types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const product = new this.productModel(createProductDto);
    return product.save();
  }

  async findAll(query: {
    search?: string;
    category?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<{ products: ProductDocument[]; total: number; pages: number }> {
    const {
      search,
      category,
      featured,
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
    } = query;

    const filter: any = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) filter.category = category;
    if (featured !== undefined) filter.isFeatured = featured;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
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

  async findFeatured(): Promise<ProductDocument[]> {
    return this.productModel
      .find({ isActive: true, isFeatured: true })
      .populate('category', 'name icon color')
      .limit(8)
      .exec();
  }

  async findById(id: string): Promise<ProductDocument> {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name icon color')
      .exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async findRelated(productId: string, limit = 4): Promise<ProductDocument[]> {
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

  async update(
    id: string,
    updateData: Partial<CreateProductDto>,
  ): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name icon color')
      .exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );
    if (!result) throw new NotFoundException('Producto no encontrado');
  }

  async updateStock(
    id: string,
    newStock: number,
  ): Promise<ProductDocument> {
    const product = await this.productModel
      .findByIdAndUpdate(id, { stock: newStock }, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async getLowStockProducts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockAlert'] },
      })
      .populate('category', 'name icon color')
      .exec();
  }

  async getTopSelling(limit = 5): Promise<ProductDocument[]> {
    return this.productModel
      .find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(limit)
      .populate('category', 'name icon color')
      .exec();
  }
}
