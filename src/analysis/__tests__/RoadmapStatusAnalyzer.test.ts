import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import { RoadmapStatusAnalyzer } from '../scanners/RoadmapStatusAnalyzer';
import { RoadmapItem } from '../scanners/RoadmapParser';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn(),
    access: vi.fn()
  }
}));

describe('RoadmapStatusAnalyzer', () => {
  let analyzer: RoadmapStatusAnalyzer;
  const mockFs = fs.promises as any;

  beforeEach(() => {
    analyzer = new RoadmapStatusAnalyzer();
    vi.clearAllMocks();
  });

  const createMockRoadmapItem = (overrides: Partial<RoadmapItem> = {}): RoadmapItem => ({
    id: 'item-1',
    title: 'Test Feature',
    description: 'A test feature implementation',
    status: 'planned',
    priority: 'medium',
    dependencies: [],
    tags: [],
    section: 'Features',
    line: 1,
    ...overrides
  });

  describe('analyzeRoadmap', () => {
    it('should analyze a roadmap document', async () => {
      const roadmapContent = `# Roadmap v1.0.0

## Features

- [x] User Authentication - Login and registration system
- [ ] Dashboard - Main user dashboard
- [x] Profile Management - User profile editing`;

      // Mock roadmap parsing
      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      // Mock code search
      mockFs.readdir.mockResolvedValue([
        { name: 'src', isDirectory: () => true, isFile: () => false },
        { name: 'package.json', isDirectory: () => false, isFile: () => true }
      ]);
      
      mockFs.readdir.mockResolvedValueOnce([
        { name: 'components', isDirectory: () => true, isFile: () => false },
        { name: 'hooks', isDirectory: () => true, isFile: () => false }
      ]);

      mockFs.readdir.mockResolvedValue([]);

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      expect(result).toMatchObject({
        document: expect.objectContaining({
          title: 'Roadmap v1.0.0',
          version: '1.0.0'
        }),
        itemStatuses: expect.any(Array),
        completionAnalysis: expect.objectContaining({
          totalItems: expect.any(Number),
          accuracyPercentage: expect.any(Number)
        }),
        discrepancies: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });

    it('should handle roadmap analysis errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(analyzer.analyzeRoadmap('nonexistent.md'))
        .rejects.toThrow('Failed to analyze roadmap nonexistent.md');
    });
  });

  describe('analyzeRoadmaps', () => {
    it('should analyze multiple roadmap files', async () => {
      const roadmapContent = `# Test Roadmap\n\n- [x] Feature 1`;

      mockFs.readFile.mockResolvedValue(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });
      mockFs.readdir.mockResolvedValue([]);

      const results = await analyzer.analyzeRoadmaps(['roadmap1.md', 'roadmap2.md']);

      expect(results).toHaveLength(2);
      expect(results[0].document.title).toBe('Test Roadmap');
      expect(results[1].document.title).toBe('Test Roadmap');
    });

    it('should handle errors gracefully', async () => {
      mockFs.readFile
        .mockResolvedValueOnce('# Roadmap 1\n\n- [x] Feature 1')
        .mockRejectedValueOnce(new Error('File error'));
      
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });
      mockFs.readdir.mockResolvedValue([]);

      const results = await analyzer.analyzeRoadmaps(['roadmap1.md', 'bad.md']);

      expect(results).toHaveLength(1);
      expect(results[0].document.title).toBe('Roadmap 1');
    });
  });

  describe('implementation detection', () => {
    it('should detect implemented features with high confidence', async () => {
      const roadmapContent = `# Roadmap

- [x] UserAuth Component - User authentication component`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      // Mock finding the component file
      mockFs.readdir.mockResolvedValueOnce([
        { name: 'src', isDirectory: () => true, isFile: () => false }
      ]);
      mockFs.readdir.mockResolvedValueOnce([
        { name: 'components', isDirectory: () => true, isFile: () => false }
      ]);
      mockFs.readdir.mockResolvedValueOnce([
        { name: 'UserAuth.tsx', isDirectory: () => false, isFile: () => true }
      ]);

      // Mock component file access
      mockFs.access.mockResolvedValue(undefined);
      
      // Mock component file content
      mockFs.readFile.mockResolvedValueOnce(`
        export const UserAuth = () => {
          return <div>User Authentication</div>;
        };
      `);

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      const userAuthStatus = result.itemStatuses.find(s => 
        s.item.title.includes('UserAuth')
      );

      expect(userAuthStatus).toBeDefined();
      expect(userAuthStatus?.evidence).toContain(
        expect.stringContaining('UserAuth.tsx')
      );
    });

    it('should detect status discrepancies', async () => {
      const roadmapContent = `# Roadmap

- [x] NonExistent Feature - This feature is marked as completed but not implemented`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      // Mock empty codebase
      mockFs.readdir.mockResolvedValue([]);
      mockFs.access.mockRejectedValue(new Error('File not found'));

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      expect(result.discrepancies).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'status-mismatch',
            severity: expect.any(String),
            description: expect.stringContaining('NonExistent Feature')
          })
        ])
      );
    });

    it('should generate appropriate recommendations', async () => {
      const roadmapContent = `# Roadmap

- [x] Missing Feature - Marked as complete but not found
- [ ] Unclear Item - Vague description`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });
      mockFs.readdir.mockResolvedValue([]);

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      expect(result.recommendations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'update-status',
            description: expect.stringContaining('Missing Feature')
          })
        ])
      );
    });
  });

  describe('completion analysis', () => {
    it('should calculate completion metrics correctly', async () => {
      const roadmapContent = `# Roadmap

- [x] Completed Feature 1
- [x] Completed Feature 2  
- [ ] Planned Feature 1
- [ ] Planned Feature 2`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });
      mockFs.readdir.mockResolvedValue([]);

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      expect(result.completionAnalysis).toMatchObject({
        totalItems: 4,
        documentedAsCompleted: 2,
        accuracyPercentage: expect.any(Number)
      });
    });

    it('should handle empty roadmaps', async () => {
      const roadmapContent = `# Empty Roadmap

No items yet.`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      expect(result.completionAnalysis).toMatchObject({
        totalItems: 0,
        documentedAsCompleted: 0,
        actuallyImplemented: 0,
        accuracyPercentage: 100 // 100% accurate when empty
      });
    });
  });

  describe('keyword extraction', () => {
    it('should extract meaningful keywords from item descriptions', async () => {
      // This tests the private extractKeywords method indirectly
      const roadmapContent = `# Roadmap

- [ ] User Authentication System - Implement login and registration functionality`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });
      mockFs.readdir.mockResolvedValue([]);

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      // The analyzer should have searched for keywords like "user", "authentication", "login", "registration"
      expect(result.itemStatuses).toHaveLength(1);
      expect(result.itemStatuses[0].item.title).toContain('User Authentication');
    });
  });

  describe('file system integration', () => {
    it('should search for component files', async () => {
      const roadmapContent = `# Roadmap

- [ ] LoginForm Component - User login form component`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      // Mock directory structure
      mockFs.readdir
        .mockResolvedValueOnce([
          { name: 'src', isDirectory: () => true, isFile: () => false }
        ])
        .mockResolvedValueOnce([
          { name: 'components', isDirectory: () => true, isFile: () => false }
        ])
        .mockResolvedValueOnce([
          { name: 'LoginForm.tsx', isDirectory: () => false, isFile: () => true }
        ]);

      // Mock component file exists
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValueOnce(`export const LoginForm = () => <form />;`);

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      const loginFormStatus = result.itemStatuses[0];
      expect(loginFormStatus.evidence).toEqual(
        expect.arrayContaining([
          expect.stringContaining('LoginForm.tsx')
        ])
      );
    });

    it('should handle file system errors gracefully', async () => {
      const roadmapContent = `# Roadmap

- [ ] Test Feature`;

      mockFs.readFile.mockResolvedValueOnce(roadmapContent);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));

      const result = await analyzer.analyzeRoadmap('roadmap.md', {
        projectPath: '/test/project'
      });

      expect(result.itemStatuses).toHaveLength(1);
      expect(result.itemStatuses[0].actualStatus).toBe('not-implemented');
    });
  });
});