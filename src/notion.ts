import { Client, LogLevel } from '@notionhq/client';
import config from './config.ts';

const notion = new Client({
  auth: config.NOTION_TOKEN,
  logLevel: config.DEBUG ? LogLevel.DEBUG : LogLevel.INFO,
});

const PROPERTIES = {
  RECURRING: 'Recurring',
  DAYS_RECURRING: 'Days Recurring',
  REMIND_IN: 'Remind In',
  NAME: 'Name',
  DAYS: 'Days',
  PAST: 'Past',
};

const DEFAULT_EMOJI = '👉';

interface NotionEvent {
  properties: Record<string, any>;
  icon?: { emoji?: string };
}

interface QueryResponse {
  results: NotionEvent[];
}

/**
 * Base class for interacting with Notion events
 */
class NotionEventBase {
  /**
   * Fetches events from the Notion database
   * @param filter The filter object for querying the database
   * @param sorts The sorting options for the query
   * @returns The query results from the Notion API
   */
  async getEvents(filter: any, sorts: any[]): Promise<QueryResponse> {
    try {
      const response = await notion.databases.query({
        database_id: config.NOTION_DATABASE_ID,
        filter,
        sorts,
      });
      return response as QueryResponse;
    } catch (error) {
      console.error('Error fetching events:', error);
      return { results: [] };
    }
  }

  /**
   * Filters events based on the specified property
   * @param events The events object returned by the Notion API
   * @param daysProperty The property name used to calculate days
   * @returns The filtered list of events
   */
  filterEvents(events: QueryResponse, daysProperty: string): NotionEvent[] {
    return events.results.filter(el => {
      const daysTill = el.properties[daysProperty]?.formula?.number;
      if (daysTill <= 3) return true;

      const remindInDaysText = el.properties[PROPERTIES.REMIND_IN]?.rich_text[0]?.plain_text;
      const remindInDays = remindInDaysText?.split(',')?.map((e: string) => +e.trim());

      // Use native Array.isArray instead of lodash
      return Array.isArray(remindInDays) && remindInDays.includes(daysTill);
    });
  }

  /**
   * Generates a message summarizing the events
   * @param events The list of events to include in the message
   * @param daysProperty The property name used to calculate days
   * @param header Message header
   * @returns The formatted message string
   */
  getMessage(events: NotionEvent[], daysProperty: string, header: string): string {
    let msg = `${header}\n`;
    events.forEach(event => {
      const name = event.properties[PROPERTIES.NAME]?.title[0]?.plain_text ?? 'Unnamed Event';
      const daysTill = event.properties[daysProperty]?.formula?.number ?? '?';
      const emoji = event.icon?.emoji ?? DEFAULT_EMOJI;

      msg += `\n${emoji} *${name}* is in \`${daysTill}\` days.`;
    });
    return msg;
  }
}

/**
 * Class for handling recurring events in Notion
 */
export class Recurring extends NotionEventBase {
  header = '🔄 *Recurring Events*';

  /**
   * Fetches recurring events from the Notion database
   */
  async getEvents(): Promise<QueryResponse> {
    return super.getEvents(
      {
        property: PROPERTIES.RECURRING,
        checkbox: { equals: true },
      },
      [{ property: PROPERTIES.DAYS_RECURRING, direction: 'ascending' }],
    );
  }

  /**
   * Filters recurring events based on the "Days Recurring" property
   */
  filterEvents(events: QueryResponse): NotionEvent[] {
    return super.filterEvents(events, PROPERTIES.DAYS_RECURRING);
  }

  /**
   * Generates a message summarizing recurring events
   */
  getMessage(events: NotionEvent[]): string {
    return super.getMessage(events, PROPERTIES.DAYS_RECURRING, this.header);
  }
}

/**
 * Class for handling upcoming events in Notion
 */
export class Upcoming extends NotionEventBase {
  header = '📅 *Upcoming Events*';

  /**
   * Fetches upcoming events from the Notion database
   */
  async getEvents(): Promise<QueryResponse> {
    return super.getEvents(
      {
        property: PROPERTIES.PAST,
        checkbox: { equals: false },
      },
      [{ property: PROPERTIES.DAYS, direction: 'ascending' }],
    );
  }

  /**
   * Filters upcoming events based on the "Days" property
   */
  filterEvents(events: QueryResponse): NotionEvent[] {
    return super.filterEvents(events, PROPERTIES.DAYS);
  }

  /**
   * Generates a message summarizing upcoming events
   */
  getMessage(events: NotionEvent[]): string {
    return super.getMessage(events, PROPERTIES.DAYS, this.header);
  }
}
