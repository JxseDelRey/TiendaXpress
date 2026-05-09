import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    create(createProductDto: CreateProductDto): Promise<ProductDocument>;
    findAll(query: {
        search?: string;
        category?: string;
        featured?: boolean;
        page?: number;
        limit?: number;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<{
        products: ProductDocument[];
        total: number;
        pages: number;
    }>;
    findFeatured(): Promise<ProductDocument[]>;
    findById(id: string): Promise<ProductDocument>;
    findRelated(productId: string, limit?: number): Promise<ProductDocument[]>;
    update(id: string, updateData: Partial<CreateProductDto>): Promise<ProductDocument>;
    remove(id: string): Promise<void>;
    updateStock(id: string, newStock: number): Promise<ProductDocument>;
    getLowStockProducts(): Promise<ProductDocument[]>;
    getTopSelling(limit?: number): Promise<ProductDocument[]>;
}
