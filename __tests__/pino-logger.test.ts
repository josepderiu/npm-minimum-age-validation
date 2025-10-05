import { PinoLogger } from '../src/utils/pino-logger';
import type { LogLevel } from '../src/utils/logger';

describe('PinoLogger', () => {
  let logger: PinoLogger;

  describe('Constructor', () => {
    it('should create logger instance with default settings', () => {
      logger = new PinoLogger();
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(PinoLogger);
    });

    it('should create logger with custom log level', () => {
      logger = new PinoLogger('debug');
      expect(logger).toBeDefined();
    });

    it('should create logger without pretty printing', () => {
      logger = new PinoLogger('info', false);
      expect(logger).toBeDefined();
    });
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      logger = new PinoLogger('debug', false);
    });

    it('should have error method', () => {
      expect(logger.error).toBeDefined();
      expect(typeof logger.error).toBe('function');
      expect(() => logger.error('Test error')).not.toThrow();
    });

    it('should have warn method', () => {
      expect(logger.warn).toBeDefined();
      expect(typeof logger.warn).toBe('function');
      expect(() => logger.warn('Test warning')).not.toThrow();
    });

    it('should have info method', () => {
      expect(logger.info).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(() => logger.info('Test info')).not.toThrow();
    });

    it('should have success method', () => {
      expect(logger.success).toBeDefined();
      expect(typeof logger.success).toBe('function');
      expect(() => logger.success('Test success')).not.toThrow();
    });

    it('should have debug method', () => {
      expect(logger.debug).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(() => logger.debug('Test debug')).not.toThrow();
    });

    it('should have step method', () => {
      expect(logger.step).toBeDefined();
      expect(typeof logger.step).toBe('function');
      expect(() => logger.step('Test step')).not.toThrow();
    });

    it('should accept variadic arguments', () => {
      expect(() => logger.info('msg', 'arg1', 'arg2', 'arg3')).not.toThrow();
      expect(() => logger.error('msg', { obj: 'data' }, [1, 2, 3])).not.toThrow();
    });
  });

  describe('Log Level Control', () => {
    beforeEach(() => {
      logger = new PinoLogger('info', false);
    });

    it('should have setLevel method', () => {
      expect(logger.setLevel).toBeDefined();
      expect(typeof logger.setLevel).toBe('function');
    });

    it('should accept all valid log levels', () => {
      const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
      levels.forEach((level) => {
        expect(() => logger.setLevel(level)).not.toThrow();
      });
    });

    it('should change log level without errors', () => {
      expect(() => logger.setLevel('error')).not.toThrow();
      expect(() => logger.setLevel('debug')).not.toThrow();
    });
  });

  describe('Child Logger', () => {
    beforeEach(() => {
      logger = new PinoLogger('info', false);
    });

    it('should create child logger with context', () => {
      const child = logger.child({ pkg: 'lodash', version: '4.17.21' });
      expect(child).toBeDefined();
      expect(child).toBeInstanceOf(PinoLogger);
    });

    it('should create child logger that has same methods', () => {
      const child = logger.child({ service: 'validator' });
      expect(child.info).toBeDefined();
      expect(child.error).toBeDefined();
      expect(child.warn).toBeDefined();
      expect(child.debug).toBeDefined();
    });

    it('should allow child logger to log without errors', () => {
      const child = logger.child({ test: 'context' });
      expect(() => child.info('Processing')).not.toThrow();
    });
  });

  describe('Flush Method', () => {
    beforeEach(() => {
      logger = new PinoLogger('info', false);
    });

    it('should have flush method', () => {
      expect(logger.flush).toBeDefined();
      expect(typeof logger.flush).toBe('function');
    });

    it('should return a promise', () => {
      const result = logger.flush();
      expect(result).toBeInstanceOf(Promise);
      return result; // Ensure it resolves
    });

    it('should resolve flush promise', async () => {
      await expect(logger.flush()).resolves.toBeUndefined();
    });
  });

  describe('Backwards Compatibility with Logger', () => {
    beforeEach(() => {
      logger = new PinoLogger('info', false);
    });

    it('should support same method signatures as Logger', () => {
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.success).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.step).toBeDefined();
      expect(logger.setLevel).toBeDefined();
    });

    it('should accept variadic arguments like Logger', () => {
      expect(() => logger.info('msg', 'arg1', 'arg2', 'arg3')).not.toThrow();
      expect(() => logger.error('msg', { obj: 'data' }, [1, 2, 3])).not.toThrow();
      expect(() => logger.warn('msg')).not.toThrow();
      expect(() => logger.debug('msg', 'arg')).not.toThrow();
    });

    it('should be drop-in replacement for Logger', () => {
      // All public methods exist
      const methods = ['error', 'warn', 'info', 'success', 'debug', 'step', 'setLevel'];
      methods.forEach((method) => {
        expect(logger).toHaveProperty(method);
        expect(typeof (logger as any)[method]).toBe('function');
      });
    });
  });

  describe('Non-blocking Behavior', () => {
    beforeEach(() => {
      logger = new PinoLogger('info', false);
    });

    it('should return immediately from log calls', () => {
      const start = Date.now();
      logger.info('Test message');
      const duration = Date.now() - start;
      // Should complete in less than 5ms (non-blocking)
      expect(duration).toBeLessThan(5);
    });

    it('should handle multiple rapid log calls', () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`);
      }
      const duration = Date.now() - start;
      // 100 calls should complete in less than 50ms (non-blocking)
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Optional pino-pretty Dependency', () => {
    it('should create logger when pino-pretty is available (dev environment)', () => {
      // In dev environment, pino-pretty is installed as devDependency
      expect(() => new PinoLogger('info', true)).not.toThrow();
    });

    it('should create logger without pretty printing in production', () => {
      // Simulate production by explicitly disabling pretty printing
      expect(() => new PinoLogger('info', false)).not.toThrow();
    });

    it('should gracefully handle pino-pretty when available', () => {
      // Test that logger creation works when pretty=true (pino-pretty available in dev)
      const logger = new PinoLogger('info', true);
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
    });

    it('should fall back to JSON logging when pino-pretty unavailable', () => {
      // When pretty=false, should use JSON logging (no pino-pretty needed)
      const logger = new PinoLogger('info', false);
      expect(logger).toBeDefined();

      // Should be able to log without errors
      expect(() => logger.info('Test message')).not.toThrow();
      expect(() => logger.error('Test error')).not.toThrow();
    });

    it('should work in TTY-detected mode', () => {
      // Test auto-detection of TTY (defaults to process.stdout.isTTY)
      const logger = new PinoLogger('info');
      expect(logger).toBeDefined();
      expect(() => logger.info('Test message')).not.toThrow();
    });

    it('should maintain all logging functionality without pino-pretty', () => {
      // Verify all methods work when pretty=false (no pino-pretty required)
      const logger = new PinoLogger('debug', false);

      expect(() => logger.error('error')).not.toThrow();
      expect(() => logger.warn('warn')).not.toThrow();
      expect(() => logger.info('info')).not.toThrow();
      expect(() => logger.success('success')).not.toThrow();
      expect(() => logger.debug('debug')).not.toThrow();
      expect(() => logger.step('step')).not.toThrow();
    });
  });
});
