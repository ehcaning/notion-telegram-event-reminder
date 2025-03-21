import { sendMessageToTelegram } from './telegram.js';
import * as notion from './notion.js';

/**
 * Processes events for a given Notion handler.
 * Fetches, filters, and sends messages for the events.
 * @param {Object} handler - An instance of a Notion handler (Recurring or Upcoming).
 */
async function processEvents(handler) {
	try {
		const events = await handler.getEvents();
		const filteredEvents = handler.filterEvents(events);

		if (filteredEvents.length === 0) {
			console.log(`No events to process for ${handler.constructor.name}.`);
			return;
		}

		const message = handler.getMessage(filteredEvents);
		await sendMessageToTelegram(message);
		console.log(`Message sent for ${handler.constructor.name}.`);
	} catch (error) {
		console.error(`Error processing events for ${handler.constructor.name}:`, error);
	}
}

/**
 * Main function to process all Notion event handlers.
 */
async function main() {
	const handlers = [new notion.Recurring(), new notion.Upcoming()];

	await Promise.all(handlers.map(handler => processEvents(handler)));
}

main().catch(error => {
	console.error('Unexpected error in the application:', error);
});
