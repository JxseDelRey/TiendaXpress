import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminGuard, JwtAuthGuard } from '../auth/guards/auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { OrderStatus } from './schemas/order.schema';
import { Reflector } from '@nestjs/core';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const customerId = req.user?._id?.toString();
    return this.ordersService.create(dto, customerId);
  }

  @Get()
  @UseGuards(new AdminGuard(new Reflector()))
  findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  findMyOrders(@Request() req: any) {
    const customerId = req.user._id;
    return this.ordersService.findMyOrders(customerId.toString());
  }

  @Get(':id')
  @UseGuards(new AdminGuard(new Reflector()))
  findOne(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Put(':id/status')
  @UseGuards(new AdminGuard(new Reflector()))
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }
}
