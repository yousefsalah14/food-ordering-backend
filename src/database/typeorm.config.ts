import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function typeOrmOptionsFactory(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    url: configService.get<string>('database.url'),
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('database.synchronize') ?? true,
  };
}
