import * as fs from 'fs/promises';
import { createDefaultConfig, loadConfig } from '../src/config/default-config';

jest.mock('fs/promises');

const mockFs = fs as jest.Mocked<typeof fs>;

describe('Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDefaultConfig', () => {
    it('should create default configuration', () => {
      const config = createDefaultConfig();

      expect(config).toHaveProperty('minimumAgeHours', 24);
      expect(config).toHaveProperty('trustedPackages');
      expect(config).toHaveProperty('registry');
      expect(config).toHaveProperty('security');
      expect(config).toHaveProperty('output');
    });

    it('should include common trusted packages', () => {
      const config = createDefaultConfig();

      expect(config.trustedPackages).toContain('@angular/*');
      expect(config.trustedPackages).toContain('@types/*');
      expect(config.trustedPackages).toContain('typescript');
    });

    it('should have secure default settings', () => {
      const config = createDefaultConfig();

      expect(config.registry?.url).toBe('https://registry.npmjs.org');
      expect(config.security?.enforceHttps).toBe(true);
      expect(config.security?.allowPrivatePackages).toBe(true);
    });

    it('should have reasonable default output settings', () => {
      const config = createDefaultConfig();

      expect(config.output?.format).toBe('console');
      expect(config.output?.logLevel).toBe('info');
      expect(config.output?.colors).toBe(true);
    });
  });

  describe('loadConfig', () => {
    it('should load and merge user configuration', async () => {
      const userConfig = {
        minimumAgeHours: 48,
        trustedPackages: ['custom-package'],
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(userConfig));

      const config = await loadConfig('/path/to/config.json');

      expect(config.minimumAgeHours).toBe(48);
      expect(config.trustedPackages).toContain('custom-package');
      expect(config.registry).toBeDefined(); // Should merge with defaults
    });

    it('should override default values with user config', async () => {
      const userConfig = {
        minimumAgeHours: 72,
        output: {
          format: 'json' as const,
          verbose: true,
          colors: false,
          logLevel: 'debug' as const,
        },
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(userConfig));

      const config = await loadConfig('/path/to/config.json');

      expect(config.minimumAgeHours).toBe(72);
      expect(config.output?.format).toBe('json');
      expect(config.output?.verbose).toBe(true);
    });

    it('should throw error when config file is not found', async () => {
      mockFs.readFile.mockRejectedValue(new Error('ENOENT: no such file'));

      await expect(loadConfig('/nonexistent/config.json')).rejects.toThrow('Failed to load config');
    });

    it('should throw error when config file has invalid JSON', async () => {
      mockFs.readFile.mockResolvedValue('invalid json{');

      await expect(loadConfig('/path/to/bad-config.json')).rejects.toThrow();
    });

    it('should handle empty user config', async () => {
      mockFs.readFile.mockResolvedValue('{}');

      const config = await loadConfig('/path/to/empty-config.json');

      expect(config).toHaveProperty('minimumAgeHours');
      expect(config).toHaveProperty('trustedPackages');
      expect(config).toHaveProperty('registry');
    });

    it('should deep merge nested configuration', async () => {
      const userConfig = {
        registry: {
          timeout: 10000,
        },
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(userConfig));

      const config = await loadConfig('/path/to/config.json');

      expect(config.registry?.timeout).toBe(10000);
      expect(config.registry?.url).toBe('https://registry.npmjs.org'); // From defaults
      expect(config.registry?.concurrency).toBeDefined(); // From defaults
    });
  });
});
