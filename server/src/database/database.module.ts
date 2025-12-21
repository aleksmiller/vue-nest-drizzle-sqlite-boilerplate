import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // Makes this module available globally without importing in every module
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}

