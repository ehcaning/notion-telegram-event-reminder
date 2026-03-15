import { run } from './src/app.ts';

/**
 * Entry point for the Notion-Telegram Event Reminder
 * Runs the event processing pipeline
 */
async function main(): Promise<void> {
  try {
    console.log('Starting Notion-Telegram Event Reminder...');
    await run();
    console.log('Event reminder processing completed.');
  } catch (error) {
    console.error('Unexpected error in the application:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
