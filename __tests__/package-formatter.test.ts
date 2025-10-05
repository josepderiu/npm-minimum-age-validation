import { PackageFormatter } from '../src/utils/package-formatter';
import type { PackageInfo } from '../src/types';

describe('PackageFormatter', () => {
  describe('toKey', () => {
    it('should format package name and version correctly', () => {
      const result = PackageFormatter.toKey('lodash', '4.17.21');
      expect(result).toBe('lodash@4.17.21');
    });

    it('should handle scoped packages', () => {
      const result = PackageFormatter.toKey('@types/node', '20.0.0');
      expect(result).toBe('@types/node@20.0.0');
    });

    it('should handle packages with complex names', () => {
      const result = PackageFormatter.toKey('@angular/core', '17.0.5');
      expect(result).toBe('@angular/core@17.0.5');
    });

    it('should handle pre-release versions', () => {
      const result = PackageFormatter.toKey('typescript', '5.0.0-beta.1');
      expect(result).toBe('typescript@5.0.0-beta.1');
    });
  });

  describe('fromPackageInfo', () => {
    it('should format PackageInfo object correctly', () => {
      const pkg: PackageInfo = {
        name: 'express',
        version: '4.18.2',
        parent: 'root',
        isNew: true,
      };

      const result = PackageFormatter.fromPackageInfo(pkg);
      expect(result).toBe('express@4.18.2');
    });

    it('should handle scoped package in PackageInfo', () => {
      const pkg: PackageInfo = {
        name: '@nestjs/core',
        version: '10.0.0',
        parent: 'root',
        isNew: false,
      };

      const result = PackageFormatter.fromPackageInfo(pkg);
      expect(result).toBe('@nestjs/core@10.0.0');
    });
  });
});
