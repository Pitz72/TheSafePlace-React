import '@testing-library/jest-dom';
import { afterEach, beforeEach, expect, vi } from 'vitest';

/**
 * Any warning or error the game prints during a test is a failure, unless it is
 * expected: a missing event, an unknown POI or a broken quest reference must
 * never slip through silently. Tests that provoke an error on purpose mock the
 * console method themselves.
 */
const EXPECTED = [/Web Audio API non disponibile/];
let problems: string[] = [];

beforeEach(() => {
    problems = [];
    for (const level of ['warn', 'error'] as const) {
        vi.spyOn(console, level).mockImplementation((...args: unknown[]) => {
            const text = args.map(a => (a instanceof Error ? a.message : String(a))).join(' ');
            if (!EXPECTED.some(pattern => pattern.test(text))) problems.push(`console.${level}: ${text}`);
        });
    }
});

afterEach(() => {
    expect(problems, 'unexpected console warnings or errors').toEqual([]);
});
