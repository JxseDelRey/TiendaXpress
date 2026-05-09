import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryMovementDto } from './dto/create-inventory-movement.dto';
import { AdminGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @UseGuards(new AdminGuard(new Reflector()))
  findAll(@Query('product') product?: string) {
    return this.inventoryService.findAll(product);
  }

  @Get('low-stock')
  @UseGuards(new AdminGuard(new Reflector()))
  getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Post('movement')
  @UseGuards(new AdminGuard(new Reflector()))
  createMovement(@Body() dto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(dto);
  }
}
