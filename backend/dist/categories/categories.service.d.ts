import { Model } from 'mongoose';
import { CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private categoryModel;
    constructor(categoryModel: Model<CategoryDocument>);
    create(dto: CreateCategoryDto): Promise<CategoryDocument>;
    findAll(): Promise<CategoryDocument[]>;
    findById(id: string): Promise<CategoryDocument>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<CategoryDocument>;
    remove(id: string): Promise<void>;
}
