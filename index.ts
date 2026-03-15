import { executeReminder } from './src/app.ts';
import { Cron, CronOptions } from 'croner';
import config from './src/config.ts';
import { logger } from './src/logger.ts';

/**
 * Entry point for the Notion-Telegram Event Reminder
 * Supports both one-time execution and scheduled cron execution
 */
async function main(): Promise<void> {
  if (!config.CRON) {
    logger.info('Starting Notion-Telegram Event Reminder in one-time mode...');
    await executeReminder();
    logger.info('Event reminder processing completed.');
    return;
  }

  try {
    logger.info('Starting Notion-Telegram Event Reminder in scheduled mode...');
    new Cron(config.CRON, { timezone: config.TIMEZONE } as CronOptions, async () => {
      try {
        logger.info('Executing scheduled reminder...');
        await executeReminder();
        logger.info('Event reminder processing completed.');
      } catch (executionError) {
        logger.error({ error: executionError }, 'Error during scheduled execution');
      }
    });

    logger.info(`Cron job scheduled with pattern: "${config.CRON}"`);
    logger.info('Application is running. Press Ctrl+C to stop.');
  } catch (cronError) {
    logger.error({ error: cronError }, 'Error setting up cron job');
    process.exit(1);
  }
}

main();
