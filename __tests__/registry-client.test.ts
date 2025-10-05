import { RegistryClient } from '../src/core/registry-client';
import { Logger } from '../src/utils/logger';
import type { RegistryConfig } from '../src/types';
import https from 'https';

// Mock https module
jest.mock('https');
const mockHttps = https as jest.Mocked<typeof https>;

describe('RegistryClient', () => {
  let registryClient: RegistryClient;
  let mockLogger: jest.Mocked<Logger>;
  let config: RegistryConfig;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      step: jest.fn(),
    } as any;

    config = {
      url: 'https://registry.npmjs.org',
      timeout: 5000,
      retries: 3,
      concurrency: 10,
      cacheTtlMinutes: 60,
      cacheEnabled: true,
    };

    registryClient = new RegistryClient(config, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPackagesPublishDates', () => {
    it('should filter out local packages', async () => {
      const packages = ['lodash@4.17.21', 'file:./local-package', 'lib/test-package@1.0.0'];

      const result = await registryClient.getPackagesPublishDates(packages);

      expect(result.size).toBe(0); // All filtered out or cached
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should handle npm packages correctly', async () => {
      const packages = ['lodash@4.17.21'];

      // Mock successful HTTP response
      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback(
              JSON.stringify({
                time: {
                  '4.17.21': '2021-05-06T16:37:45.000Z',
                },
              })
            );
          } else if (event === 'end') {
            callback();
          }
        }),
      };

      const mockRequest = {
        on: jest.fn(),
        destroy: jest.fn(),
      };

      mockHttps.get.mockImplementation((url, options, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      await registryClient.getPackagesPublishDates(packages);

      expect(mockHttps.get).toHaveBeenCalledWith(
        expect.stringContaining('lodash'),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should handle HTTP errors gracefully', async () => {
      const packages = ['test-package@1.0.0'];

      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Network error'));
          }
        }),
        end: jest.fn(),
        setTimeout: jest.fn(),
      };

      mockHttps.get.mockImplementation((url, options, callback) => {
        return mockRequest as any;
      });

      const result = await registryClient.getPackagesPublishDates(packages);

      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed to fetch'));
    });

    it('should handle timeout errors', async () => {
      const packages = ['timeout-package@1.0.0'];

      const mockRequest = {
        on: jest.fn((event, callback) => {
          if (event === 'timeout') {
            callback();
          }
        }),
        destroy: jest.fn(),
      };

      mockHttps.get.mockImplementation(() => {
        return mockRequest as any;
      });

      const result = await registryClient.getPackagesPublishDates(packages);

      expect(result.size).toBe(0);
    });

    it('should handle invalid JSON responses', async () => {
      const packages = ['invalid-json@1.0.0'];

      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback('invalid json');
          } else if (event === 'end') {
            callback();
          }
        }),
      };

      const mockRequest = {
        on: jest.fn(),
        destroy: jest.fn(),
      };

      mockHttps.get.mockImplementation((url, options, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      const result = await registryClient.getPackagesPublishDates(packages);

      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle invalid dates', async () => {
      const packages = ['invalid-date@1.0.0'];

      const mockResponse = {
        statusCode: 200,
        on: jest.fn((event, callback) => {
          if (event === 'data') {
            callback(
              JSON.stringify({
                time: {
                  '1.0.0': 'not-a-valid-date',
                },
              })
            );
          } else if (event === 'end') {
            callback();
          }
        }),
      };

      const mockRequest = {
        on: jest.fn(),
        destroy: jest.fn(),
      };

      mockHttps.get.mockImplementation((url, options, callback) => {
        if (typeof callback === 'function') {
          callback(mockResponse as any);
        }
        return mockRequest as any;
      });

      const result = await registryClient.getPackagesPublishDates(packages);

      expect(result.size).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid date'));
    });
  });
});
