import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { lucia } from '../../lib/lucia';

/**
 * Periodically removes expired sessions from the database. Lucia validates
 * expiry on each request but never deletes stale rows, so without this they
 * accumulate forever.
 */
@Injectable()
export class SessionCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionCleanupService.name);
  private timer?: NodeJS.Timeout;
  private readonly intervalMs = 24 * 60 * 60 * 1000; // daily

  onModuleInit() {
    void this.cleanup(); // run once at startup
    this.timer = setInterval(() => void this.cleanup(), this.intervalMs);
    // Don't keep the event loop alive solely for this timer.
    this.timer.unref?.();
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private async cleanup() {
    try {
      await lucia.deleteExpiredSessions();
      this.logger.debug('Expired sessions cleaned up');
    } catch (error) {
      this.logger.error('Failed to clean up expired sessions', error as Error);
    }
  }
}
