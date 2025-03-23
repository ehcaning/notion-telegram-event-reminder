import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

async function getSecrets() {
	if (process.env.ENVIRONMENT !== 'lambda') {
		return {
			TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
			TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
			NOTION_TOKEN: process.env.NOTION_TOKEN,
			NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
		};
	}
	return await getSecretsFromSecretsManager();
}

async function getSecretsFromSecretsManager() {
	const client = new SecretsManagerClient({
		region: 'eu-north-1',
	});

	const response = await client.send(
		new GetSecretValueCommand({
			SecretId: 'lambda/notion-telegram-event-reminder',
		})
	);

	const secret = response.SecretString;
	return JSON.parse(secret);
}

export default await getSecrets();
