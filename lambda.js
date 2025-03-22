import { run } from './app.js';

export async function handler(event) {
	try {
		await run();
		return { statusCode: 200, body: 'Events processed successfully.' };
	} catch (error) {
		console.error('Unexpected error in the application:', error);
		return { statusCode: 500, body: 'Internal Server Error' };
	}
}
