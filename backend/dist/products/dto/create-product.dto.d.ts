export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    discountPercent?: number;
    category: string;
    stock: number;
    lowStockAlert?: number;
    images?: string[];
    isFeatured?: boolean;
    costPrice?: number;
    barcode?: string;
    unit?: string;
    tags?: string[];
}
