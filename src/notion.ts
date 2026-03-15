import { Client, LogLevel } from '@notionhq/client';
import config from './config.ts';
import { logger } from './logger.ts';

const notionClient = new Client({
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

abstract class NotionEventBase {
  abstract readonly header: string;
  abstract readonly daysProperty: string;
  abstract getFilterConfig(): any;

  async getEvents(): Promise<QueryResponse> {
    try {
      const response = await notionClient.databases.query({
        database_id: config.NOTION_DATABASE_ID,
        filter: this.getFilterConfig(),
        sorts: [{ property: this.daysProperty, direction: 'ascending' }],
      });
      return response as QueryResponse;
    } catch (error) {
      logger.error({ error }, 'Error fetching events from Notion database');
      return { results: [] };
    }
  }

  filterEvents(events: QueryResponse): NotionEvent[] {
    return events.results.filter(el => {
      const daysTill = el.properties[this.daysProperty]?.formula?.number;
      if (daysTill <= 3) return true;

      const remindInDaysText = el.properties[PROPERTIES.REMIND_IN]?.rich_text[0]?.plain_text;
      const remindInDays = remindInDaysText?.split(',')?.map((e: string) => +e.trim());

      return Array.isArray(remindInDays) && remindInDays.includes(daysTill);
    });
  }

  getMessage(events: NotionEvent[]): string {
    let msg = `${this.header}\n`;
    events.forEach(event => {
      const name = event.properties[PROPERTIES.NAME]?.title[0]?.plain_text ?? 'Unnamed Event';
      const daysTill = event.properties[this.daysProperty]?.formula?.number ?? '?';
      const emoji = event.icon?.emoji ?? DEFAULT_EMOJI;

      msg += `\n${emoji} *${name}* is in \`${daysTill}\` days.`;
    });
    return msg;
  }
}

export class Recurring extends NotionEventBase {
  readonly header = '🔄 *Recurring Events*';
  readonly daysProperty = PROPERTIES.DAYS_RECURRING;

  getFilterConfig(): any {
    return {
      property: PROPERTIES.RECURRING,
      checkbox: { equals: true },
    };
  }
}

export class Upcoming extends NotionEventBase {
  readonly header = '📅 *Upcoming Events*';
  readonly daysProperty = PROPERTIES.DAYS;

  getFilterConfig(): any {
    return {
      property: PROPERTIES.PAST,
      checkbox: { equals: false },
    };
  }
}
