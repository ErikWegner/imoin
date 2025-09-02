import { Logger } from './logger';

export class RemoteLog implements Logger {
  private remoteLog = (level: string, ...args: unknown[]) => {
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    void fetch('http://localhost:3000/log', {
      headers,
      method: 'POST',
      body: JSON.stringify({
        message: args.join(' '),
        level,
      }),
    }).catch(() => {
      /* drop */
    });
  };

  log(...args: unknown[]): void {
    this.remoteLog('info', ...args);
  }
  error(...args: unknown[]): void {
    this.remoteLog('error', ...args);
  }
  debug(...args: unknown[]): void {
    this.remoteLog('debug', ...args);
  }
}

const logger = new RemoteLog();
export const remoteLog = (
  level: 'debug' | 'info' | 'error',
  ...args: unknown[]
) => {
  switch (level) {
    case 'debug':
      logger.debug(...args);
      break;
    case 'error':
      logger.error(...args);
      break;
    default:
      logger.log(...args);
  }
};
