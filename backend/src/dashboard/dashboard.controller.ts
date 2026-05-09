import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('metrics')
  @UseGuards(new AdminGuard(new Reflector()))
  getMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('sales-chart')
  @UseGuards(new AdminGuard(new Reflector()))
  getSalesChart(@Query('days') days?: string) {
    return this.dashboardService.getSalesChart(days ? parseInt(days) : 7);
  }

  @Get('top-products')
  @UseGuards(new AdminGuard(new Reflector()))
  getTopProducts(@Query('limit') limit?: string) {
    return this.dashboardService.getTopProducts(limit ? parseInt(limit) : 5);
  }
}
