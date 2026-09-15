import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type RateLimitBucket = { count: number; resetAt: number };

/**
 * A safe local baseline. Replace this with a shared-store limiter before
 * horizontally scaling the API, because memory is local to one process.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ ip?: string; route?: { path?: string } }>();
    const key = `${request.ip ?? 'unknown'}:${request.route?.path ?? 'unknown'}`;
    const now = Date.now();
    const windowMs = this.config.getOrThrow<number>('RATE_LIMIT_WINDOW_MS');
    const maximum = this.config.getOrThrow<number>('RATE_LIMIT_MAX');
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (bucket.count >= maximum) {
      throw new HttpException(
        'Rate limit exceeded.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.count += 1;
    return true;
  }
}
