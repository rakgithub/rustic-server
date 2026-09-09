import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export const DATABASE = Symbol('DATABASE');
export type Database = NodePgDatabase<typeof schema>;

/**
 * Provides one typed database client for the whole application.
 * Other services inject DATABASE instead of constructing their own connections.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Database => {
        const pool = new Pool({
          connectionString: config.getOrThrow<string>('DATABASE_URL'),
        });

        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
