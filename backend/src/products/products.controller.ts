import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminGuard, JwtAuthGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.findAll({
      search,
      category,
      featured: featured === 'true' ? true : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  @Get('featured')
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get('low-stock')
  @UseGuards(new AdminGuard(new Reflector()))
  getLowStock() {
    return this.productsService.getLowStockProducts();
  }

  @Get('top-selling')
  @UseGuards(new AdminGuard(new Reflector()))
  getTopSelling(@Query('limit') limit?: string) {
    return this.productsService.getTopSelling(limit ? parseInt(limit) : 5);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Get(':id/related')
  getRelated(@Param('id') id: string) {
    return this.productsService.findRelated(id);
  }

  @Post()
  @UseGuards(new AdminGuard(new Reflector()))
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
