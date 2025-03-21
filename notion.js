import { Client, LogLevel } from '@notionhq/client';
import * as _ from 'lodash-es';
import config from './config.js';

const notion = new Client({
	auth: config.NOTION_TOKEN,
	logLevel: LogLevel.DEBUG,
});

// Constants for property names
const PROPERTIES = {
	RECURRING: 'Recurring',
	DAYS_RECURRING: 'Days Recurring',
	REMIND_IN: 'Remind In',
	NAME: 'Name',
	DAYS: 'Days',
	PAST: 'Past',
};

/**
 * Base class for interacting with Notion events.
 */
class NotionEventBase {
	/**
	 * @param {string} databaseId - The ID of the Notion database.
	 */
	constructor(databaseId) {
		this.databaseId = databaseId;
	}

	/**
	 * Fetches events from the Notion database.
	 * @param {Object} filter - The filter object for querying the database.
	 * @param {Array<Object>} sorts - The sorting options for the query.
	 * @returns {Promise<Object>} The query results from the Notion API.
	 */
	async getEvents(filter, sorts) {
		try {
			return await notion.databases.query({
				database_id: this.databaseId,
				filter,
				sorts,
			});
		} catch (error) {
			console.error('Error fetching events:', error);
			return { results: [] };
		}
	}

	/**
	 * Filters events based on the specified property.
	 * @param {Object} events - The events object returned by the Notion API.
	 * @param {string} daysProperty - The property name used to calculate days.
	 * @returns {Array<Object>} The filtered list of events.
	 */
	filterEvents(events, daysProperty) {
		return events.results.filter(el => {
			const daysTill = el.properties[daysProperty]?.formula?.number;
			if (daysTill <= 3) return true;

			const remindInDays = el.properties[PROPERTIES.REMIND_IN]?.rich_text[0]?.plain_text
				?.split(',')
				?.map(e => +e);
			return _.isArray(remindInDays) && remindInDays.includes(daysTill);
		});
	}

	/**
	 * Generates a message summarizing the events.
	 * @param {Array<Object>} events - The list of events to include in the message.
	 * @param {string} daysProperty - The property name used to calculate days.
	 * @param {string} emojiFallback - The fallback emoji to use if an event has no icon.
	 * @returns {string} The formatted message string.
	 */
	getMessage(events, daysProperty, emojiFallback) {
		let msg = `⏰ *Events:*\n`;
		events.forEach(event => {
			const name = event.properties[PROPERTIES.NAME]?.title[0]?.plain_text ?? 'Unnamed Event';
			const daysTill = event.properties[daysProperty]?.formula?.number ?? '?';
			const emoji = event.icon?.emoji ?? emojiFallback;

			msg += `\n${emoji} *${name}* is in \`${daysTill}\` days.`;
		});
		return msg;
	}
}

/**
 * Class for handling recurring events in Notion.
 * Extends the NotionEventBase class.
 */
export class Recurring extends NotionEventBase {
	/**
	 * Initializes the Recurring class with the database ID from the config.
	 */
	constructor() {
		super(config.NOTION_DATABASE_ID);
	}

	/**
	 * Fetches recurring events from the Notion database.
	 * @returns {Promise<Object>} The query results from the Notion API.
	 */
	async getEvents() {
		return super.getEvents(
			{
				property: PROPERTIES.RECURRING,
				checkbox: { equals: true },
			},
			[{ property: PROPERTIES.DAYS_RECURRING, direction: 'ascending' }]
		);
	}

	/**
	 * Filters recurring events based on the "Days Recurring" property.
	 * @param {Object} events - The events object returned by the Notion API.
	 * @returns {Array<Object>} The filtered list of recurring events.
	 */
	filterEvents(events) {
		return super.filterEvents(events, PROPERTIES.DAYS_RECURRING);
	}

	/**
	 * Generates a message summarizing recurring events.
	 * @param {Array<Object>} events - The list of recurring events.
	 * @returns {string} The formatted message string.
	 */
	getMessage(events) {
		return super.getMessage(events, PROPERTIES.DAYS_RECURRING, '👉');
	}
}

/**
 * Class for handling upcoming events in Notion.
 * Extends the NotionEventBase class.
 */
export class Upcoming extends NotionEventBase {
	/**
	 * Initializes the Upcoming class with the database ID from the config.
	 */
	constructor() {
		super(config.NOTION_DATABASE_ID);
	}

	/**
	 * Fetches upcoming events from the Notion database.
	 * @returns {Promise<Object>} The query results from the Notion API.
	 */
	async getEvents() {
		return super.getEvents(
			{
				property: PROPERTIES.PAST,
				checkbox: { equals: false },
			},
			[{ property: PROPERTIES.DAYS, direction: 'ascending' }]
		);
	}

	/**
	 * Filters upcoming events based on the "Days" property.
	 * @param {Object} events - The events object returned by the Notion API.
	 * @returns {Array<Object>} The filtered list of upcoming events.
	 */
	filterEvents(events) {
		return super.filterEvents(events, PROPERTIES.DAYS);
	}

	/**
	 * Generates a message summarizing upcoming events.
	 * @param {Array<Object>} events - The list of upcoming events.
	 * @returns {string} The formatted message string.
	 */
	getMessage(events) {
		return super.getMessage(events, PROPERTIES.DAYS, '👉');
	}
}
