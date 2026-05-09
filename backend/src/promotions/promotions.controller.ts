import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PromotionsService, CreatePromotionDto } from './promotions.service';
import { AdminGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';

@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  @Get()
  findAll(@Query('active') active?: string) {
    return this.promotionsService.findAll(active === 'true');
  }

  @Post()
  @UseGuards(new AdminGuard(new Reflector()))
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionsService.create(dto);
  }

  @Put(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  update(@Param('id') id: string, @Body() dto: Partial<CreatePromotionDto>) {
    return this.promotionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
