import config from './config.ts';
import { logger } from './logger.ts';

/**
 * Sends a message to a Telegram chat using Bun's native fetch API
 * @param message The message to send
 * @param options Optional parameters for the message
 * @param options.parse_mode Parse mode for the message (Markdown, HTML, or plain text)
 * @throws Will throw an error if the message fails to send
 */
export async function sendMessageToTelegram(message: string, options: Record<string, any> = {}): Promise<any> {
  if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
    logger.error('Telegram bot token or chat ID is missing in the configuration.');
    return;
  }

  if (!message || typeof message !== 'string') {
    logger.error('Invalid message. Please provide a non-empty string.');
    return;
  }

  const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: config.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: options.parse_mode || 'Markdown',
    ...options, // Allow additional options like `disable_notification`, `reply_to_message_id`, etc.
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    logger.info({ messageId: data.result?.message_id }, 'Message sent to Telegram');
    return data;
  } catch (error) {
    logger.error({ error }, 'Error sending message to Telegram');
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : String(error)}`);
  }
}
