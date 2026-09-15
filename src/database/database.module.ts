import {
  Global,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export const DATABASE = Symbol('DATABASE');
export const DATABASE_POOL = Symbol('DATABASE_POOL');
export type Database = NodePgDatabase<typeof schema>;

@Injectable()
class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * Provides one typed database client for the whole application.
 * Other services inject DATABASE instead of constructing their own connections.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Pool =>
        new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        }),
    },
    {
      provide: DATABASE,
      inject: [DATABASE_POOL],
      useFactory: (pool: Pool): Database => drizzle(pool, { schema }),
    },
    DatabaseLifecycle,
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
