import axios from 'axios';
import config from './config.js';

/**
 * Sends a message to a Telegram chat.
 * @param {string} message - The message to send.
 * @param {Object} options - Optional parameters for the message.
 * @param {string} [options.parse_mode='Markdown'] - Parse mode for the message (Markdown, HTML, or plain text).
 * @throws Will throw an error if the message fails to send.
 */
export async function sendMessageToTelegram(message, options = {}) {
	if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
		console.error('Telegram bot token or chat ID is missing in the configuration.');
		return;
	}

	if (!message || typeof message !== 'string') {
		console.error('Invalid message. Please provide a non-empty string.');
		return;
	}

	const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
	const data = {
		chat_id: config.TELEGRAM_CHAT_ID,
		text: message,
		parse_mode: options.parse_mode || 'Markdown',
		...options, // Allow additional options like `disable_notification`, `reply_to_message_id`, etc.
	};

	try {
		const response = await axios.post(url, data);
		console.log('Message sent successfully:', response.data);
		return response.data;
	} catch (error) {
		const errorMessage = error.response ? error.response.data : error.message;
		console.error('Error sending message to Telegram:', errorMessage);
		throw new Error(`Failed to send message: ${errorMessage}`);
	}
}
