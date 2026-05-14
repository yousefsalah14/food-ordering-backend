import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SafeResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => toSafeResponse(data)));
  }
}

function toSafeResponse<T>(data: T): T {
  return toSafeResponseInternal(data, new WeakSet<object>(), 0);
}

function toSafeResponseInternal<T>(
  data: T,
  visited: WeakSet<object>,
  depth: number,
): T {
  if (depth > 12) {
    return undefined as T;
  }

  if (Array.isArray(data)) {
    return data
      .map((item) => toSafeResponseInternal(item, visited, depth + 1))
      .filter((item) => item !== undefined) as T;
  }

  if (!data || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return data.toISOString() as T;
  }

  if (Buffer.isBuffer(data) || data instanceof Uint8Array) {
    return data;
  }

  if (visited.has(data)) {
    return undefined as T;
  }

  visited.add(data);

  const safe: Record<string, unknown> = {};

  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    if (key === 'password' || typeof value === 'function') {
      return;
    }

    const safeValue = toSafeResponseInternal(value, visited, depth + 1);

    if (safeValue !== undefined) {
      safe[key] = safeValue;
    }
  });

  visited.delete(data);

  return safe as T;
}
