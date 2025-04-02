import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';

export class ReminderStack extends cdk.Stack {
	public readonly secret: secretsmanager.Secret;

	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		// Create the secret
		this.secret = new secretsmanager.Secret(this, 'ReminderSecrets', {
			secretName: 'lambda/notion-telegram-event-reminder',
			description: 'Secrets for Notion Telegram Event Reminder',
		});

		// Create the Lambda function
		const reminderFunction = new lambda.Function(this, 'ReminderFunction', {
			runtime: lambda.Runtime.NODEJS_22_X,
			handler: 'lambda.handler',
			code: lambda.Code.fromAsset(path.join(__dirname, '../..'), {
				exclude: ['.git', '.github', '.gitignore', '.vscode', 'cdk', 'doc', 'README.md'],
			}),
			memorySize: 256,
			timeout: Duration.seconds(10),
			environment: {
				ENVIRONMENT: 'lambda',
			},
		});

		// Create EventBridge rule to trigger the function daily at 7 AM EST
		const rule = new events.Rule(this, 'DailyReminderRule', {
			schedule: events.Schedule.cron({
				minute: '0',
				hour: '7',
				day: '*',
				month: '*',
				year: '*',
			}),
			description: 'Triggers the reminder function daily at 7 AM EST',
		});

		// Add the Lambda function as a target
		rule.addTarget(new targets.LambdaFunction(reminderFunction));

		// Grant the Lambda function permission to read the secret
		this.secret.grantRead(reminderFunction);
	}
}
