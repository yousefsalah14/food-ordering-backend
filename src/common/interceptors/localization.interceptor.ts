import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  localizeResponse,
  normalizeLanguage,
} from '../utils/localization.util';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const requestedLanguage =
      request.query?.lang ?? request.headers['accept-language'];
    const language = normalizeLanguage(requestedLanguage);

    return next.handle().pipe(map((data) => localizeResponse(data, language)));
  }
}
