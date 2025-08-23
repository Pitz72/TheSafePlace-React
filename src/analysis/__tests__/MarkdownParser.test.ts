import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import { MarkdownParser } from '../scanners/MarkdownParser';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    stat: vi.fn()
  }
}));

describe('MarkdownParser', () => {
  let parser: MarkdownParser;
  const mockFs = fs.promises as any;

  beforeEach(() => {
    parser = new MarkdownParser();
    vi.clearAllMocks();
  });

  describe('parseMarkdownFile', () => {
    it('should parse a simple Markdown document', async () => {
      const content = `# Test Document

This is a test document.

## Section 1

Content for section 1.

### Subsection 1.1

Content for subsection 1.1.

## Section 2

Content for section 2.`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await parser.parseMarkdownFile('test.md');

      expect(result).toMatchObject({
        filePath: 'test.md',
        title: 'Test Document',
        content,
        sections: expect.arrayContaining([
          expect.objectContaining({
            level: 1,
            title: 'Test Document',
            subsections: expect.arrayContaining([
              expect.objectContaining({
                level: 2,
                title: 'Section 1',
                subsections: expect.arrayContaining([
                  expect.objectContaining({
                    level: 3,
                    title: 'Subsection 1.1'
                  })
                ])
              }),
              expect.objectContaining({
                level: 2,
                title: 'Section 2'
              })
            ])
          })
        ])
      });
    });

    it('should extract version information', async () => {
      const content = `# Version 1.2.3

This document describes v1.2.3 features.

## Changes in version 1.2.2

Some changes here.

Version: 1.2.1 was the previous release.`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await parser.parseMarkdownFile('test.md');

      expect(result.versions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            version: '1.2.3',
            type: 'header',
            line: 1
          }),
          expect.objectContaining({
            version: '1.2.3',
            type: 'text',
            line: 3
          }),
          expect.objectContaining({
            version: '1.2.2',
            type: 'header',
            line: 5
          }),
          expect.objectContaining({
            version: '1.2.1',
            type: 'text',
            line: 9
          })
        ])
      );
    });

    it('should extract feature information', async () => {
      const content = `# Features

- [x] Implemented: User authentication
- [ ] Planned: Dashboard redesign
- Feature: New reporting system (in-progress)

## Tasks

- [x] Complete login system
- [ ] Add user profiles`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await parser.parseMarkdownFile('test.md');

      expect(result.features).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'User authentication',
            status: 'implemented',
            section: 'Features'
          }),
          expect.objectContaining({
            name: 'Dashboard redesign',
            status: 'planned',
            section: 'Features'
          }),
          expect.objectContaining({
            name: 'New reporting system (in-progress)',
            status: 'in-progress',
            section: 'Features'
          }),
          expect.objectContaining({
            name: 'Complete login system',
            status: 'implemented',
            section: 'Tasks'
          }),
          expect.objectContaining({
            name: 'Add user profiles',
            status: 'planned',
            section: 'Tasks'
          })
        ])
      );
    });

    it('should calculate metadata correctly', async () => {
      const content = `# Test Document

This is a test with [a link](http://example.com).

\`\`\`javascript
console.log('code block');
\`\`\`

- List item 1
- List item 2

1. Numbered item 1
2. Numbered item 2`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await parser.parseMarkdownFile('test.md');

      expect(result.metadata).toMatchObject({
        wordCount: expect.any(Number),
        lineCount: 13,
        headingCount: 1,
        linkCount: 1,
        codeBlockCount: 1,
        listCount: 4
      });
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));

      await expect(parser.parseMarkdownFile('nonexistent.md'))
        .rejects.toThrow('Failed to parse Markdown file nonexistent.md');
    });
  });

  describe('parseMarkdownFiles', () => {
    it('should parse multiple files', async () => {
      mockFs.readFile
        .mockResolvedValueOnce('# Document 1\n\nContent 1')
        .mockResolvedValueOnce('# Document 2\n\nContent 2');
      
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await parser.parseMarkdownFiles(['doc1.md', 'doc2.md']);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Document 1');
      expect(result[1].title).toBe('Document 2');
    });

    it('should handle errors gracefully', async () => {
      mockFs.readFile
        .mockResolvedValueOnce('# Document 1\n\nContent 1')
        .mockRejectedValueOnce(new Error('File error'));
      
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const result = await parser.parseMarkdownFiles(['doc1.md', 'bad.md']);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Document 1');
    });
  });

  describe('searchInMarkdown', () => {
    it('should find pattern matches', async () => {
      const content = `# Test Document

This contains TODO items.

## Section

Another TODO here.`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const document = await parser.parseMarkdownFile('test.md');
      const results = parser.searchInMarkdown(document, /TODO/g);

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        match: 'TODO',
        line: 3,
        section: 'Test Document'
      });
      expect(results[1]).toMatchObject({
        match: 'TODO',
        line: 7,
        section: 'Section'
      });
    });
  });

  describe('extractLinks', () => {
    it('should extract different types of links', async () => {
      const content = `# Test Document

[External link](https://example.com)
[Internal link](#section)
[Relative link](./other.md)`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const document = await parser.parseMarkdownFile('test.md');
      const links = parser.extractLinks(document);

      expect(links).toEqual([
        expect.objectContaining({
          text: 'External link',
          url: 'https://example.com',
          type: 'external',
          line: 3
        }),
        expect.objectContaining({
          text: 'Internal link',
          url: '#section',
          type: 'internal',
          line: 4
        }),
        expect.objectContaining({
          text: 'Relative link',
          url: './other.md',
          type: 'relative',
          line: 5
        })
      ]);
    });
  });

  describe('validateMarkdown', () => {
    it('should detect missing title', async () => {
      const content = `## Section 1

Content without H1 title.`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const document = await parser.parseMarkdownFile('test.md');
      const issues = parser.validateMarkdown(document);

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'warning',
            message: 'Document has no H1 title'
          })
        ])
      );
    });

    it('should detect empty sections', async () => {
      const content = `# Test Document

## Empty Section

## Section with Content

Some content here.`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const document = await parser.parseMarkdownFile('test.md');
      const issues = parser.validateMarkdown(document);

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'warning',
            message: 'Section "Empty Section" is empty',
            section: 'Empty Section'
          })
        ])
      );
    });

    it('should detect broken internal links', async () => {
      const content = `# Test Document

[Link to nonexistent section](#nonexistent)

## Existing Section

[Link to existing section](#existing-section)`;

      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({ mtime: new Date('2024-01-01') });

      const document = await parser.parseMarkdownFile('test.md');
      const issues = parser.validateMarkdown(document);

      expect(issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'error',
            message: 'Broken internal link: #nonexistent',
            line: 3
          })
        ])
      );
    });
  });
});