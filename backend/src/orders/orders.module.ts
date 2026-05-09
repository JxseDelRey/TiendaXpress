import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';


// Schemas
import { Order, OrderSchema } from './schemas/order.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';

// Services & Controllers
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

// Otros módulos
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // 🔗 MongoDB Schemas
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),

    // 🔥 NECESARIO para usar HttpService (Make)
    HttpModule,

    // 👤 Para usar UsersService
    UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}