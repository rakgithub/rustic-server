import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database/database.module.js';

@Injectable()
export class HealthService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async isDatabaseReady(): Promise<boolean> {
    try {
      await this.db.execute(sql`select 1`);
      return true;
    } catch {
      return false;
    }
  }
}
