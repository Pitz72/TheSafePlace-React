import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import { AntiRegressionAnalyzer } from '../scanners/AntiRegressionAnalyzer';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    stat: vi.fn(),
    access: vi.fn()
  }
}));

describe('AntiRegressionAnalyzer', () => {
  let analyzer: AntiRegressionAnalyzer;
  const mockFs = fs.promises as any;

  beforeEach(() => {
    analyzer = new AntiRegressionAnalyzer();
    vi.clearAllMocks();
  });

  describe('analyzeAntiRegressionFile', () => {
    it('should analyze anti-regression document with protection rules', async () => {
      const content = `# Anti-Regression Protection v1.2.3

## File Protection Rules

- [x] IMMUTABLE: src/core/config.ts - Critical configuration file
- [ ] PROTECTION: package.json - Version lock at v1.2.3
- [x] FILE PROTECTION: README.md - Documentation integrity (HIGH severity)

## DSAR Requirements

- DSAR: User data collection
  - Data Type: Personal information
  - Retention: 2 years
  - Access: User portal
  - Deletion: Automated after retention
  - Implemented: Yes
  - Notes: Fully compliant with GDPR`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await analyzer.analyzeAntiRegressionFile('anti-regression.md');

      expect(result).toMatchObject({
        filePath: 'anti-regression.md',
        title: 'Anti-Regression Protection v1.2.3',
        version: '1.2.3',
        protectionRules: expect.arrayContaining([
          expect.objectContaining({
            type: 'immutable',
            target: 'src/core/config.ts',
            description: 'Critical configuration file',
            severity: 'critical',
            isActive: true,
            section: 'File Protection Rules'
          }),
          expect.objectContaining({
            type: 'version-lock',
            target: 'package.json',
            description: 'Version lock at v1.2.3',
            version: '1.2.3',
            isActive: false,
            section: 'File Protection Rules'
          }),
          expect.objectContaining({
            type: 'file-protection',
            target: 'README.md',
            description: 'Documentation integrity (HIGH severity)',
            severity: 'high',
            isActive: true,
            section: 'File Protection Rules'
          })
        ]),
        dsarRequirements: expect.arrayContaining([
          expect.objectContaining({
            description: 'User data collection',
            dataType: 'Personal information',
            retention: '2 years',
            access: 'User portal',
            deletion: 'Automated after retention',
            isImplemented: true,
            implementationNotes: 'Fully compliant with GDPR',
            section: 'DSAR Requirements'
          })
        ])
      });
    });

    it('should calculate metadata correctly', async () => {
      const content = `# Anti-Regression Protection

## Rules

- [x] CRITICAL: File protection for core files
- [x] HIGH: Version lock protection
- [ ] MEDIUM: Configuration validation
- [ ] LOW: Documentation checks

## DSAR

- DSAR: User data
  - Implemented: Yes
- DSAR: Analytics data
  - Implemented: No`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await analyzer.analyzeAntiRegressionFile('test.md');

      expect(result.metadata).toMatchObject({
        totalRules: 4,
        activeRules: 2,
        rulesBySeverity: {
          critical: 1,
          high: 1,
          medium: 1,
          low: 1
        },
        totalDSARRequirements: 2,
        implementedDSARRequirements: 1
      });
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(analyzer.analyzeAntiRegressionFile('nonexistent.md'))
        .rejects.toThrow('Failed to analyze anti-regression file nonexistent.md');
    });
  });

  describe('analyzeAntiRegressionFiles', () => {
    it('should analyze multiple files', async () => {
      mockFs.readFile
        .mockResolvedValueOnce('# Anti-Regression 1\n\n- [x] RULE: Test rule 1')
        .mockResolvedValueOnce('# Anti-Regression 2\n\n- [x] RULE: Test rule 2');
      
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await analyzer.analyzeAntiRegressionFiles(['file1.md', 'file2.md']);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Anti-Regression 1');
      expect(result[1].title).toBe('Anti-Regression 2');
    });

    it('should handle errors gracefully', async () => {
      mockFs.readFile
        .mockResolvedValueOnce('# Anti-Regression 1\n\n- [x] RULE: Test rule 1')
        .mockRejectedValueOnce(new Error('File error'));
      
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await analyzer.analyzeAntiRegressionFiles(['file1.md', 'bad.md']);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Anti-Regression 1');
    });
  });

  describe('validateRulesAgainstProject', () => {
    it('should validate file protection rules', async () => {
      const document = {
        filePath: 'test.md',
        title: 'Test',
        protectionRules: [
          {
            id: 'rule-1',
            type: 'file-protection' as const,
            target: 'package.json',
            description: 'Protect package.json',
            rules: [],
            severity: 'high' as const,
            isActive: true,
            line: 1,
            section: 'Rules'
          }
        ],
        dsarRequirements: [],
        metadata: {
          totalRules: 1,
          activeRules: 1,
          rulesByType: { 'file-protection': 1 },
          rulesBySeverity: { high: 1 },
          totalDSARRequirements: 0,
          implementedDSARRequirements: 0,
          lastUpdated: new Date()
        },
        lastModified: new Date()
      };

      mockFs.stat.mockResolvedValue({ isFile: () => true });

      const results = await analyzer.validateRulesAgainstProject(document, '/project');

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        rule: document.protectionRules[0],
        status: 'compliant',
        message: 'Protected file package.json exists'
      });
    });

    it('should detect file protection violations', async () => {
      const document = {
        filePath: 'test.md',
        title: 'Test',
        protectionRules: [
          {
            id: 'rule-1',
            type: 'file-protection' as const,
            target: 'missing.json',
            description: 'Protect missing file',
            rules: [],
            severity: 'high' as const,
            isActive: true,
            line: 1,
            section: 'Rules'
          }
        ],
        dsarRequirements: [],
        metadata: {
          totalRules: 1,
          activeRules: 1,
          rulesByType: { 'file-protection': 1 },
          rulesBySeverity: { high: 1 },
          totalDSARRequirements: 0,
          implementedDSARRequirements: 0,
          lastUpdated: new Date()
        },
        lastModified: new Date()
      };

      mockFs.stat.mockRejectedValue(new Error('File not found'));

      const results = await analyzer.validateRulesAgainstProject(document, '/project');

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        rule: document.protectionRules[0],
        status: 'violation',
        message: 'Protected file missing.json does not exist'
      });
    });

    it('should validate version lock rules', async () => {
      const document = {
        filePath: 'test.md',
        title: 'Test',
        protectionRules: [
          {
            id: 'rule-1',
            type: 'version-lock' as const,
            target: 'package.json',
            description: 'Version lock',
            rules: [],
            severity: 'critical' as const,
            version: '1.2.3',
            isActive: true,
            line: 1,
            section: 'Rules'
          }
        ],
        dsarRequirements: [],
        metadata: {
          totalRules: 1,
          activeRules: 1,
          rulesByType: { 'version-lock': 1 },
          rulesBySeverity: { critical: 1 },
          totalDSARRequirements: 0,
          implementedDSARRequirements: 0,
          lastUpdated: new Date()
        },
        lastModified: new Date()
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify({ version: '1.2.3' }));

      const results = await analyzer.validateRulesAgainstProject(document, '/project');

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        rule: document.protectionRules[0],
        status: 'compliant',
        message: 'Version locked at 1.2.3'
      });
    });

    it('should detect version lock violations', async () => {
      const document = {
        filePath: 'test.md',
        title: 'Test',
        protectionRules: [
          {
            id: 'rule-1',
            type: 'version-lock' as const,
            target: 'package.json',
            description: 'Version lock',
            rules: [],
            severity: 'critical' as const,
            version: '1.2.3',
            isActive: true,
            line: 1,
            section: 'Rules'
          }
        ],
        dsarRequirements: [],
        metadata: {
          totalRules: 1,
          activeRules: 1,
          rulesByType: { 'version-lock': 1 },
          rulesBySeverity: { critical: 1 },
          totalDSARRequirements: 0,
          implementedDSARRequirements: 0,
          lastUpdated: new Date()
        },
        lastModified: new Date()
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify({ version: '1.2.4' }));

      const results = await analyzer.validateRulesAgainstProject(document, '/project');

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        rule: document.protectionRules[0],
        status: 'violation',
        message: 'Version mismatch: expected 1.2.3, found 1.2.4'
      });
    });

    it('should skip inactive rules', async () => {
      const document = {
        filePath: 'test.md',
        title: 'Test',
        protectionRules: [
          {
            id: 'rule-1',
            type: 'file-protection' as const,
            target: 'package.json',
            description: 'Inactive rule',
            rules: [],
            severity: 'high' as const,
            isActive: false,
            line: 1,
            section: 'Rules'
          }
        ],
        dsarRequirements: [],
        metadata: {
          totalRules: 1,
          activeRules: 0,
          rulesByType: { 'file-protection': 1 },
          rulesBySeverity: { high: 1 },
          totalDSARRequirements: 0,
          implementedDSARRequirements: 0,
          lastUpdated: new Date()
        },
        lastModified: new Date()
      };

      const results = await analyzer.validateRulesAgainstProject(document, '/project');

      expect(results).toHaveLength(0);
    });
  });
});