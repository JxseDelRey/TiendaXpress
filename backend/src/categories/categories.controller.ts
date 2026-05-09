import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AdminGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  findAll() { return this.categoriesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.categoriesService.findById(id); }

  @Post()
  @UseGuards(new AdminGuard(new Reflector()))
  create(@Body() dto: CreateCategoryDto) { return this.categoriesService.create(dto); }

  @Put(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  update(@Param('id') id: string, @Body() dto: Partial<CreateCategoryDto>) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  remove(@Param('id') id: string) { return this.categoriesService.remove(id); }
}
