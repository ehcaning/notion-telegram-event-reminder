import { sendMessageToTelegram } from './telegram.ts';
import * as notion from './notion.ts';
import { logger } from './logger.ts';

interface NotionHandler {
  constructor: { name: string };
  getEvents: () => Promise<any>;
  filterEvents: (events: any) => any[];
  getMessage: (events: any[]) => string;
}

/**
 * Processes events for a given Notion handler
 * Fetches, filters, and sends messages for the events
 * @param handler An instance of a Notion handler (Recurring or Upcoming)
 */
async function processEvents(handler: NotionHandler): Promise<void> {
  try {
    const events = await handler.getEvents();
    const filteredEvents = handler.filterEvents(events);

    if (filteredEvents.length === 0) {
      logger.debug(`No events to process for ${handler.constructor.name}.`);
      return;
    }

    const message = handler.getMessage(filteredEvents);
    await sendMessageToTelegram(message);
    logger.info(`Message sent for ${handler.constructor.name}.`);
  } catch (error) {
    logger.error({ error, handlerName: handler.constructor.name }, 'Error processing events');
  }
}

/**
 * Core function to execute the event reminder once
 * Fetches events from Notion and sends Telegram messages
 */
export async function executeReminder(): Promise<void> {
  const handlers: NotionHandler[] = [new notion.Recurring(), new notion.Upcoming()];
  await Promise.all(handlers.map(handler => processEvents(handler)));
}
