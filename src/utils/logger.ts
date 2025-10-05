import chalk from 'chalk';
import type { ILogger } from './logger-interface';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export class Logger implements ILogger {
  private logLevel: LogLevel;
  private useColors: boolean;

  constructor(level: LogLevel = 'info', useColors: boolean = true) {
    this.logLevel = level;
    this.useColors = useColors;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.logLevel];
  }

  private colorize(message: string, color: chalk.Chalk): string {
    return this.useColors ? color(message) : message;
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.colorize(`❌ ${message}`, chalk.red), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.colorize(`⚠️  ${message}`, chalk.yellow), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.colorize(`ℹ️  ${message}`, chalk.blue), ...args);
    }
  }

  success(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.colorize(`✅ ${message}`, chalk.green), ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.colorize(`🐛 ${message}`, chalk.gray), ...args);
    }
  }

  step(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.colorize(`   ${message}`, chalk.white), ...args);
    }
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setColors(useColors: boolean): void {
    this.useColors = useColors;
  }
}
