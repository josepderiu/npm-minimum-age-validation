import { PackageValidator } from '../src/core/validator';
import type { ValidatorConfig } from '../src/types';
import type { ILogger } from '../src/utils/logger-interface';

/**
 * Mock the default logger implementation (PinoLogger) without importing it directly.
 *
 * @remarks
 * This test suite tests the validator's verbose behavior while remaining decoupled
 * from the specific logger implementation. By:
 *
 * 1. Using `ILogger` type instead of concrete `PinoLogger` type
 * 2. Mocking via module path rather than direct import
 * 3. Accessing mock via `jest.requireMock()` in test assertions
 *
 * The tests will continue to work even if the logger implementation changes,
 * as long as it implements the `ILogger` interface and is used in the validator.
 *
 * This follows the dependency inversion principle: depend on abstractions (ILogger),
 * not on concrete implementations (PinoLogger).
 */
jest.mock('../src/utils/pino-logger', () => {
  return {
    PinoLogger: jest.fn().mockImplementation((level: string, colors: boolean) => {
      return {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        step: jest.fn(),
        success: jest.fn(),
        setLevel: jest.fn(),
      } as ILogger;
    }),
  };
});

describe('PackageValidator - Verbose Behavior', () => {
  const baseConfig: ValidatorConfig = {
    minimumAgeHours: 24,
    trustedPackages: [],
    registry: {
      url: 'https://registry.npmjs.org',
      timeout: 5000,
      retries: 3,
      concurrency: 10,
      cacheTtlMinutes: 60,
      cacheEnabled: true,
    },
    output: {
      format: 'console',
      verbose: false,
      colors: false,
      logLevel: 'error',
    },
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Logger Method Calls Based on Verbose Flag', () => {
    it('should create logger with debug level when verbose is true', () => {
      const verboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: true,
          colors: false,
          logLevel: 'debug',
        },
      };

      new PackageValidator(verboseConfig);

      // Verify the default logger implementation was instantiated with debug level (first arg) and colors=false (second arg)
      const PinoLoggerMock = jest.requireMock('../src/utils/pino-logger').PinoLogger;
      expect(PinoLoggerMock).toHaveBeenCalledWith('debug', false);
    });

    it('should create logger with info level when verbose is false', () => {
      const nonVerboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: false,
          colors: false,
          logLevel: 'info',
        },
      };

      new PackageValidator(nonVerboseConfig);

      // Verify the default logger implementation was instantiated with info level (first arg) and colors=false (second arg)
      const PinoLoggerMock = jest.requireMock('../src/utils/pino-logger').PinoLogger;
      expect(PinoLoggerMock).toHaveBeenCalledWith('info', false);
    });
  });

  describe('Configuration Storage', () => {
    it('should store verbose flag in validator config', () => {
      const verboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: true,
          colors: false,
          logLevel: 'debug',
        },
      };

      const validator = new PackageValidator(verboseConfig);

      // Access the private config through type assertion for testing
      const config = (validator as any).config;
      expect(config.output?.verbose).toBe(true);
      expect(config.output?.logLevel).toBe('debug');
    });

    it('should store non-verbose flag in validator config', () => {
      const nonVerboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: false,
          colors: false,
          logLevel: 'info',
        },
      };

      const validator = new PackageValidator(nonVerboseConfig);

      // Access the private config through type assertion for testing
      const config = (validator as any).config;
      expect(config.output?.verbose).toBe(false);
      expect(config.output?.logLevel).toBe('info');
    });
  });

  describe('Logger Instance Creation', () => {
    it('should pass colors flag to logger when verbose is true', () => {
      const verboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: true,
          colors: true,
          logLevel: 'debug',
        },
      };

      new PackageValidator(verboseConfig);

      // Default logger constructor: (logLevel: string, colors: boolean)
      const PinoLoggerMock = jest.requireMock('../src/utils/pino-logger').PinoLogger;
      expect(PinoLoggerMock).toHaveBeenCalledWith('debug', true);
    });

    it('should pass colors=false to logger when verbose is false', () => {
      const nonVerboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: false,
          colors: false,
          logLevel: 'info',
        },
      };

      new PackageValidator(nonVerboseConfig);

      // Default logger constructor: (logLevel: string, colors: boolean)
      const PinoLoggerMock = jest.requireMock('../src/utils/pino-logger').PinoLogger;
      expect(PinoLoggerMock).toHaveBeenCalledWith('info', false);
    });
  });

  describe('Validator Behavior Consistency', () => {
    it('should maintain verbose config through validator lifecycle', () => {
      const verboseConfig: ValidatorConfig = {
        ...baseConfig,
        output: {
          format: 'console',
          verbose: true,
          colors: false,
          logLevel: 'debug',
        },
      };

      const validator = new PackageValidator(verboseConfig);
      const config1 = (validator as any).config;

      // Config should remain consistent
      expect(config1.output?.verbose).toBe(true);

      // Create another validator with same config
      const validator2 = new PackageValidator(verboseConfig);
      const config2 = (validator2 as any).config;

      expect(config2.output?.verbose).toBe(true);
      expect(config2.output?.logLevel).toBe(config1.output?.logLevel);
    });
  });
});
