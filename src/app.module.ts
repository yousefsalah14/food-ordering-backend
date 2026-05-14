import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/env.configuration';
import { typeOrmOptionsFactory } from './database/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { AdminModule } from './admin/admin.module';
import { validateEnv } from './config/env.validation';
import { DataSource } from 'typeorm';

// Interceptors disabled for now:
// import { LocalizationInterceptor } from './common/interceptors/localization.interceptor';
// import { SafeResponseInterceptor } from './common/interceptors/safe-response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [configuration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmOptionsFactory,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Interceptors disabled for debugging — re-enable when localization is needed:
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LocalizationInterceptor,
    // },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: SafeResponseInterceptor,
    // },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private dataSource: DataSource) {}

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      this.logger.log('Database connected successfully');
    }
  }
}
