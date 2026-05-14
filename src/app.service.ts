import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppInfo() {
    return {
      name: 'Food Ordering API',
      version: '1.0.0',
      docs: '/api/docs',
      status: 'ok',
    };
  }
}
