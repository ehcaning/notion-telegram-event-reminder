import pino from 'pino';

const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

export const logger = pino({
  level: logLevel,
  formatters: {
    level: label => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
