import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(search?: string, category?: string, featured?: string, page?: string, limit?: string, minPrice?: string, maxPrice?: string): Promise<{
        products: import("./schemas/product.schema").ProductDocument[];
        total: number;
        pages: number;
    }>;
    findFeatured(): Promise<import("./schemas/product.schema").ProductDocument[]>;
    getLowStock(): Promise<import("./schemas/product.schema").ProductDocument[]>;
    getTopSelling(limit?: string): Promise<import("./schemas/product.schema").ProductDocument[]>;
    findOne(id: string): Promise<import("./schemas/product.schema").ProductDocument>;
    getRelated(id: string): Promise<import("./schemas/product.schema").ProductDocument[]>;
    create(dto: CreateProductDto): Promise<import("./schemas/product.schema").ProductDocument>;
    update(id: string, dto: Partial<CreateProductDto>): Promise<import("./schemas/product.schema").ProductDocument>;
    remove(id: string): Promise<void>;
}
