import { Injectable } from '@nestjs/common';
import { db } from '../../db/drizzle';

/**
 * Service providing database connection instance
 * Exported globally via DatabaseModule
 */
@Injectable()
export class DatabaseService {
  /**
   * Get the Drizzle database instance
   * @returns Drizzle database instance
   */
  get db() {
    return db;
  }
}
