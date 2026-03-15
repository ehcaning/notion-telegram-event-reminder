import { executeReminder } from './src/app.ts';
import { Cron, CronOptions } from 'croner';
import config from './src/config.ts';

/**
 * Entry point for the Notion-Telegram Event Reminder
 * Supports both one-time execution and scheduled cron execution
 */
async function main(): Promise<void> {
  if (!config.CRON) {
    console.log('Starting Notion-Telegram Event Reminder in one-time mode...');
    await executeReminder();
    console.log('Event reminder processing completed.');
    return;
  }

  try {
    console.log('Starting Notion-Telegram Event Reminder in scheduled mode...');
    const job = new Cron(config.CRON, { timezone: config.TIMEZONE } as CronOptions, async () => {
      try {
        console.log(`[${new Date().toISOString()}] Executing scheduled reminder...`);
        await executeReminder();
        console.log(`[${new Date().toISOString()}] Event reminder processing completed.`);
      } catch (executionError) {
        console.error(
          `[${new Date().toISOString()}] Error during scheduled execution:`,
          executionError instanceof Error ? executionError.message : String(executionError),
        );
      }
    });

    console.log(`Cron job scheduled with pattern: "${config.CRON}"`);
    console.log('Application is running. Press Ctrl+C to stop.');
  } catch (cronError) {
    const errorMessage = cronError instanceof Error ? cronError.message : String(cronError);
    console.error(`Error: ${errorMessage}`);
    process.exit(1);
  }
}

main();
