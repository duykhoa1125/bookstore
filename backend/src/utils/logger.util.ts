/**
 * Simple structured logger utility for the backend
 * In production, this could be replaced with a more robust solution like Winston or Pino
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
    [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

export const logger = {
    debug(message: string, context?: LogContext): void {
        if (shouldLog('debug')) {
            console.debug(formatMessage('debug', message, context));
        }
    },

    info(message: string, context?: LogContext): void {
        if (shouldLog('info')) {
            console.info(formatMessage('info', message, context));
        }
    },

    warn(message: string, context?: LogContext): void {
        if (shouldLog('warn')) {
            console.warn(formatMessage('warn', message, context));
        }
    },

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (shouldLog('error')) {
            const errorContext = error instanceof Error
                ? {
                    ...context,
                    errorMessage: error.message,
                    stack: error.stack
                }
                : { ...context, error };
            console.error(formatMessage('error', message, errorContext));
        }
    },

    /**
     * Log HTTP request (useful for debugging API calls)
     */
    request(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
        if (shouldLog(level)) {
            console[level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error'](
                formatMessage(level, `${method} ${path} ${statusCode} ${duration}ms`, context)
            );
        }
    },
};

export default logger;
