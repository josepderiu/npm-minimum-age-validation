import { Logger } from '../src/utils/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    // Mock console methods to avoid console output during tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    logger = new Logger('info', false); // No colors for cleaner tests
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create logger instance', () => {
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should log info messages', () => {
    logger.info('Test info message');
    expect(console.log).toHaveBeenCalledWith('ℹ️  Test info message');
  });

  it('should log warning messages', () => {
    logger.warn('Test warning message');
    expect(console.warn).toHaveBeenCalledWith('⚠️  Test warning message');
  });

  it('should log error messages', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalledWith('❌ Test error message');
  });

  it('should log success messages', () => {
    logger.success('Test success message');
    expect(console.log).toHaveBeenCalledWith('✅ Test success message');
  });

  it('should log step messages', () => {
    logger.step('Test step message');
    expect(console.log).toHaveBeenCalledWith('   Test step message');
  });

  it('should respect log level', () => {
    const debugLogger = new Logger('error', false);
    debugLogger.info('This should not be logged');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should set log level', () => {
    logger.setLevel('debug');
    logger.debug('Debug message');
    expect(console.log).toHaveBeenCalledWith('🐛 Debug message');
  });

  it('should set colors', () => {
    logger.setColors(true);
    expect(logger).toBeInstanceOf(Logger);
  });
});
