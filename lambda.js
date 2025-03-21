import { sendMessageToTelegram } from './telegram.js';
import * as notion from './notion.js';

export async function handler(event) {
	try {
		const handlers = [new notion.Recurring(), new notion.Upcoming()];
		await Promise.all(handlers.map(handler => processEvents(handler)));
		return { statusCode: 200, body: 'Events processed successfully.' };
	} catch (error) {
		console.error('Unexpected error in the application:', error);
		return { statusCode: 500, body: 'Internal Server Error' };
	}
}

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
