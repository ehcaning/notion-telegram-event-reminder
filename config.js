/**
 * Validates that the required environment variables are set.
 * Throws an error if any required variable is missing.
 * @param {string} variable - The name of the environment variable.
 * @param {string} description - A description of the variable for error messages.
 * @returns {string} The value of the environment variable.
 */
function getEnvVariable(variable, description) {
	const value = process.env[variable];
	if (!value) {
		throw new Error(`Missing required environment variable: ${description} (${variable})`);
	}
	return value;
}

export default {
	TELEGRAM_BOT_TOKEN: getEnvVariable('TELEGRAM_BOT_TOKEN', 'Telegram Bot Token'),
	TELEGRAM_CHAT_ID: getEnvVariable('TELEGRAM_CHAT_ID', 'Telegram Chat ID'),
	NOTION_TOKEN: getEnvVariable('NOTION_TOKEN', 'Notion API Token'),
	NOTION_DATABASE_ID: getEnvVariable('NOTION_DATABASE_ID', 'Notion Database ID'),
};
