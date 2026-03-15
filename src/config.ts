/**
 * Configuration module for Notion-Telegram Event Reminder
 * Loads configuration from environment variables
 */

import { logger } from './logger.ts';

const requiredKeys = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'NOTION_TOKEN', 'NOTION_DATABASE_ID'];

interface Config {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  NOTION_TOKEN: string;
  NOTION_DATABASE_ID: string;
  DEBUG?: boolean;
  CRON?: string;
  TIMEZONE?: string;
}

/**
 * Validates that all required configuration keys are present
 * @param config Configuration object to validate
 * @returns Validated configuration object
 * @throws Error if required keys are missing
 */
function validateConfig(config: Record<string, string | undefined>): Config {
  const missingKeys = requiredKeys.filter(key => !config[key]);
  if (missingKeys.length > 0) {
    logger.error({ missingKeys }, 'Missing required configuration keys');
    throw new Error(`Missing required configuration: ${missingKeys.join(', ')}`);
  }

  const validConfig = {
    TELEGRAM_BOT_TOKEN: config.TELEGRAM_BOT_TOKEN!,
    TELEGRAM_CHAT_ID: config.TELEGRAM_CHAT_ID!,
    NOTION_TOKEN: config.NOTION_TOKEN!,
    NOTION_DATABASE_ID: config.NOTION_DATABASE_ID!,
    DEBUG: config.DEBUG === 'true',
    CRON: config.CRON,
    TIMEZONE: config.TIMEZONE || 'UTC',
  };

  logger.debug(
    { debugMode: validConfig.DEBUG, timezone: validConfig.TIMEZONE, hasCron: !!validConfig.CRON },
    'Configuration loaded successfully',
  );

  return validConfig;
}

/**
 * Load configuration from environment variables
 */
function loadConfig(): Config {
  // Support .env file loading in Bun (Bun automatically loads .env files)
  return validateConfig(process.env as Record<string, string | undefined>);
}

export default loadConfig();
