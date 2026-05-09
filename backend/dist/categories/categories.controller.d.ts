import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<import("./schemas/category.schema").CategoryDocument[]>;
    findOne(id: string): Promise<import("./schemas/category.schema").CategoryDocument>;
    create(dto: CreateCategoryDto): Promise<import("./schemas/category.schema").CategoryDocument>;
    update(id: string, dto: Partial<CreateCategoryDto>): Promise<import("./schemas/category.schema").CategoryDocument>;
    remove(id: string): Promise<void>;
}
