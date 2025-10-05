import { execSync } from 'child_process';
import { GitHelper } from '../src/utils/git-helper';

// Mock the child_process module
jest.mock('child_process');

describe('GitHelper', () => {
  const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('executeCommand', () => {
    it('should execute command and return output', () => {
      const mockOutput = 'command output';
      mockedExecSync.mockReturnValueOnce(mockOutput as any);

      const result = GitHelper.executeCommand('git status');

      expect(result).toBe(mockOutput);
      expect(mockedExecSync).toHaveBeenCalledWith('git status', {
        encoding: 'utf-8',
        stdio: 'pipe',
      });
    });

    it('should return empty string on error', () => {
      mockedExecSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });

      const result = GitHelper.executeCommand('git invalid');

      expect(result).toBe('');
    });
  });

  describe('hasPackageLockChanges', () => {
    it('should return true when package-lock.json has changes', () => {
      mockedExecSync.mockReturnValueOnce('M package-lock.json\n' as any);

      const result = GitHelper.hasPackageLockChanges();

      expect(result).toBe(true);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'git status --porcelain package-lock.json',
        expect.any(Object)
      );
    });

    it('should return false when package-lock.json has no changes', () => {
      mockedExecSync.mockReturnValueOnce('' as any);

      const result = GitHelper.hasPackageLockChanges();

      expect(result).toBe(false);
    });
  });

  describe('getPackageLockFromHead', () => {
    it('should return package-lock.json content from HEAD', () => {
      const mockContent = '{"name": "test", "version": "1.0.0"}';
      mockedExecSync.mockReturnValueOnce(mockContent as any);

      const result = GitHelper.getPackageLockFromHead();

      expect(result).toBe(mockContent);
      expect(mockedExecSync).toHaveBeenCalledWith(
        'git show HEAD:package-lock.json',
        expect.any(Object)
      );
    });

    it('should return null when command returns empty string', () => {
      mockedExecSync.mockReturnValueOnce('' as any);

      const result = GitHelper.getPackageLockFromHead();

      expect(result).toBe(null);
    });
  });

  describe('getCurrentBranch', () => {
    it('should return current branch name', () => {
      mockedExecSync.mockReturnValueOnce('main\n' as any);

      const result = GitHelper.getCurrentBranch();

      expect(result).toBe('main');
      expect(mockedExecSync).toHaveBeenCalledWith(
        'git rev-parse --abbrev-ref HEAD',
        expect.any(Object)
      );
    });

    it('should return "unknown" when command returns empty string', () => {
      mockedExecSync.mockReturnValueOnce('' as any);

      const result = GitHelper.getCurrentBranch();

      expect(result).toBe('unknown');
    });

    it('should trim whitespace from branch name', () => {
      mockedExecSync.mockReturnValueOnce('  feature/test  \n' as any);

      const result = GitHelper.getCurrentBranch();

      expect(result).toBe('feature/test');
    });
  });

  describe('getLastCommitHash', () => {
    it('should return last commit hash', () => {
      const mockHash = 'a1b2c3d4e5f6';
      mockedExecSync.mockReturnValueOnce(`${mockHash}\n` as any);

      const result = GitHelper.getLastCommitHash();

      expect(result).toBe(mockHash);
      expect(mockedExecSync).toHaveBeenCalledWith('git rev-parse HEAD', expect.any(Object));
    });

    it('should return "unknown" when command returns empty string', () => {
      mockedExecSync.mockReturnValueOnce('' as any);

      const result = GitHelper.getLastCommitHash();

      expect(result).toBe('unknown');
    });

    it('should trim whitespace from commit hash', () => {
      mockedExecSync.mockReturnValueOnce('  abc123  \n' as any);

      const result = GitHelper.getLastCommitHash();

      expect(result).toBe('abc123');
    });
  });

  describe('isGitRepository', () => {
    it('should return true when in a git repository', () => {
      mockedExecSync.mockReturnValueOnce('.git\n' as any);

      const result = GitHelper.isGitRepository();

      expect(result).toBe(true);
      expect(mockedExecSync).toHaveBeenCalledWith('git rev-parse --git-dir', expect.any(Object));
    });

    it('should return false when command returns empty string', () => {
      mockedExecSync.mockReturnValueOnce('' as any);

      const result = GitHelper.isGitRepository();

      expect(result).toBe(false);
    });
  });
});
