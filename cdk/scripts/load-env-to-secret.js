const { SecretsManagerClient, PutSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

async function loadEnvToSecret() {
	const secretValue = JSON.stringify({
		TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
		TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
		NOTION_TOKEN: process.env.NOTION_TOKEN,
		NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
	});

	const client = new SecretsManagerClient({
		region: process.env.AWS_DEFAULT_REGION || 'eu-north-1',
	});

	try {
		await client.send(
			new PutSecretValueCommand({
				SecretId: 'lambda/notion-telegram-event-reminder',
				SecretString: secretValue,
			})
		);
		console.log('Successfully updated secret with .env contents');
	} catch (error) {
		console.error('Failed to update secret:', error);
		process.exit(1);
	}
}

loadEnvToSecret();
