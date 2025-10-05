/**
 * Common logger interface for both Logger and PinoLogger implementations.
 *
 * This interface ensures backwards compatibility and allows gradual migration
 * from the legacy console.log-based Logger to the async Pino.js-based PinoLogger.
 *
 * @remarks
 * - Both `Logger` and `PinoLogger` implement this interface
 * - Allows type-safe logger abstraction in classes that accept loggers
 * - Enables dependency injection and easier testing
 * - Facilitates migration without breaking existing code
 *
 * @example
 * ```typescript
 * // Use ILogger for type-safe dependency injection
 * class MyService {
 *   constructor(private logger: ILogger) {}
 *
 *   doSomething() {
 *     this.logger.info('Doing something');
 *   }
 * }
 *
 * // Works with both implementations
 * const service1 = new MyService(new Logger());      // Legacy
 * const service2 = new MyService(new PinoLogger());  // Modern
 * ```
 *
 * @public
 */
export interface ILogger {
  /**
   * Log an error message.
   * @param message - The error message to log
   * @param args - Additional arguments to include in the log
   */
  error(message: string, ...args: unknown[]): void;

  /**
   * Log a warning message.
   * @param message - The warning message to log
   * @param args - Additional arguments to include in the log
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * Log an informational message.
   * @param message - The info message to log
   * @param args - Additional arguments to include in the log
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log a success message.
   * @param message - The success message to log
   * @param args - Additional arguments to include in the log
   */
  success(message: string, ...args: unknown[]): void;

  /**
   * Log a debug message (only shown when debug level is enabled).
   * @param message - The debug message to log
   * @param args - Additional arguments to include in the log
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Log a step message (typically used for workflow/process steps).
   * @param message - The step message to log
   * @param args - Additional arguments to include in the log
   */
  step(message: string, ...args: unknown[]): void;

  /**
   * Set the minimum log level for output.
   * @param level - The minimum level to log ('error', 'warn', 'info', or 'debug')
   * @remarks
   * - 'error': Only error messages
   * - 'warn': Warnings and errors
   * - 'info': Info, warnings, and errors (default)
   * - 'debug': All messages including debug
   */
  setLevel(level: 'error' | 'warn' | 'info' | 'debug'): void;
}
