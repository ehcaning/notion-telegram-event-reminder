import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const requiredKeys = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'NOTION_TOKEN', 'NOTION_DATABASE_ID'];
function validateConfig(config) {
	const missingKeys = requiredKeys.filter(key => !config[key]);
	if (missingKeys.length > 0) {
		throw new Error(`Missing required configuration: ${missingKeys.join(', ')}`);
	}

	return config;
}

async function getSecrets() {
	if (process.env.ENVIRONMENT === 'lambda') {
		return await getSecretsFromSecretsManager();
	}
	return validateConfig({
		TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
		TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
		NOTION_TOKEN: process.env.NOTION_TOKEN,
		NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
	});
}

async function getSecretsFromSecretsManager() {
	const client = new SecretsManagerClient({
		region: process.env.AWS_DEFAULT_REGION || 'eu-north-1',
	});

	try {
		const response = await client.send(
			new GetSecretValueCommand({
				SecretId: 'lambda/notion-telegram-event-reminder',
			})
		);
		const secret = response.SecretString;
		return validateConfig(JSON.parse(secret));
	} catch (error) {
		throw new Error(`Failed to fetch secrets: ${error.message}`);
	}
}

export default await getSecrets();
