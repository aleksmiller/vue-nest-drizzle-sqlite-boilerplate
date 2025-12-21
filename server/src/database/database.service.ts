import { Injectable } from '@nestjs/common';
import { db } from '../../db/drizzle';

@Injectable()
export class DatabaseService {
  get db() {
    return db;
  }
}

