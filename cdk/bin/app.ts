#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ReminderStack } from '../lib/reminder-stack';

const app = new cdk.App();
new ReminderStack(app, 'NotionTelegramEventReminder');
