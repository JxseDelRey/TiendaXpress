import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const category = new this.categoryModel(dto);
    return category.save();
  }

  async findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find({ isActive: true }).exec();
  }

  async findById(id: string): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findById(id).exec();
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async update(id: string, dto: Partial<CreateCategoryDto>): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findByIdAndUpdate(id, dto, { new: true });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async remove(id: string): Promise<void> {
    await this.categoryModel.findByIdAndUpdate(id, { isActive: false });
  }
}
