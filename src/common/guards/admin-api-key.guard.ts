import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('ADMIN_API_KEY');

    // Local development remains frictionless; production always requires a key.
    if (!expected && this.config.get<string>('NODE_ENV') !== 'production') {
      return true;
    }

    const received = context
      .switchToHttp()
      .getRequest()
      .header('x-admin-api-key');
    if (!expected || !received || !safeEqual(expected, received)) {
      throw new UnauthorizedException('A valid admin API key is required.');
    }

    return true;
  }
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
