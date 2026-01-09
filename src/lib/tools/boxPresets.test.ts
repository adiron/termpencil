
import { describe, it, expect } from 'vitest';
import { makeResolver, FG, BG } from './boxPresets';

describe('makeResolver', () => {
    it('flattens symbols correctly', () => {
        // Mock colors. The actual structure doesn't matter for the resolver, 
        // it just needs to replace symbols with these values.
        const mockFg = { name: 'mock-fg' } as any;
        const mockBg = { name: 'mock-bg' } as any;

        const resolver = makeResolver(mockFg, mockBg);

        const input = {
            someProp: 'value',
            nested: {
                fg: FG,
                bg: BG,
                other: 'static'
            },
            list: [FG, BG, 'text'],
            mixed: [
                { color: FG },
                { color: BG }
            ]
        };

        const expected = {
            someProp: 'value',
            nested: {
                fg: mockFg,
                bg: mockBg,
                other: 'static'
            },
            list: [mockFg, mockBg, 'text'],
            mixed: [
                { color: mockFg },
                { color: mockBg }
            ]
        };

        const result = resolver(input as any);

        expect(result).toEqual(expected);
    });

    it('handles deep nesting', () => {
        const mockFg = 'fg-val' as any;
        const mockBg = 'bg-val' as any;
        const resolver = makeResolver(mockFg, mockBg);

        const input = {
            level1: {
                level2: {
                    level3: {
                        val: FG
                    }
                }
            }
        };

        const expected = {
            level1: {
                level2: {
                    level3: {
                        val: mockFg
                    }
                }
            }
        };

        expect(resolver(input as any)).toEqual(expected);
    });

    it('throws on unknown symbols', () => {
        const resolver = makeResolver('fg' as any, 'bg' as any);
        const UnknownSym = Symbol('unknown');
        const input = { val: UnknownSym };

        expect(() => resolver(input as any)).toThrow(/Unknown symbol/);
    });
});
