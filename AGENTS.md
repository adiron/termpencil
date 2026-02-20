# Agent Guidelines for Termpencil

## Project Overview
Termpencil is a terminal/ASCII art editor built with Svelte 5, TypeScript, and SCSS. It allows users to create terminal-style graphics, export preview scripts, and save/load binary files with 256-color terminal support.

## Commands

### Development
- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build

### Type Checking
- `npm run check` - Run svelte-check and TypeScript validation (run before committing)

### Testing
- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode
- Single test file: `npx vitest run src/lib/screenbuffer.test.ts`

### CLI
- `npm run build:cli` - Build CLI tool
- `npm run tp:preview` - Build CLI and run preview script

## Code Style

### TypeScript
- This is a TypeScript project. All implementation code should be written in TypeScript unless otherwise specified.
- Use TypeScript for all files (`.ts` and `.svelte`)
- Prefer explicit types over `any`
- Use `type` for unions/intersections, `interface` for objects

### Svelte 5 Runes
This project uses Svelte 5 runes. Use:
- `$state` for reactive state (local or global)
- `$derived` for computed values
- `$effect` for side effects (with proper cleanup)
- `$props` for component props (use `$props()` destructuring)

Example:
```typescript
let count = $state(0);
let doubled = $derived(count * 2);

$effect(() => {
  console.log(count);
  return () => { /* cleanup */ };
});
```

### File Naming
- Components: `PascalCase.svelte` (e.g., `Editor.svelte`)
- TypeScript files: `camelCase.ts` (e.g., `screenbuffer.ts`)
- State files with runes: `name.svelte.ts` (e.g., `state.svelte.ts`)
- Test files: `name.test.ts`

### Imports
Group imports in this order:
1. External libraries (svelte, vitest)
2. Internal modules (`./screenbuffer`, `./constants`)
3. Types (`import type { ... }`)

```typescript
import { describe, it, expect } from 'vitest';
import { makeEmptyScreenBuffer, setCharAt } from './screenbuffer';
import type { GlobalState, Tool } from './types';
```

### Classes vs Functions
- Use **classes** for Tools (implementing the `Tool` interface)
- Use **functions** for utilities and state management

### Styling
- Use SCSS in `<style lang="scss">` blocks
- Follow BEM-ish naming: `.block`, `.block__element`, `.block--modifier`
- Use CSS custom properties for theming (`var(--color-N)`)

### Error Handling
- Throw errors with descriptive messages
- Use early returns to avoid nested conditionals
- Validate inputs at function boundaries

```typescript
export function getCharAt<T>(buffer: ScreenBuffer<T>, x: number, y: number): T {
  if (x < 0 || x >= buffer.width || y < 0) {
    throw new Error(`Beyond index: ${x}, ${y}`);
  }
  // ...
}
```

### Testing
- Use Vitest with `describe`/`it`/`expect`
- Name tests descriptively: `it('should encode and decode a buffer', ...)`
- Use `toEqual` for deep equality, `toBe` for primitives
- Test files should test files that they are named after, e.g. `somefile.test.ts` will test `somefile.ts`.

```typescript
import { describe, it, expect } from 'vitest';

describe('screenbuffer', () => {
  it('should create empty buffer with correct dimensions', () => {
    const buffer = makeEmptyScreenBuffer(80, 40, DEFAULT_CHAR);
    expect(buffer.width).toBe(80);
    expect(buffer.chars.length).toBe(80 * 40);
  });
});
```

### State Management
- Global state lives in `src/lib/state.svelte.ts` using a singleton `$state` object
- Access global state with: `import { globalState } from './state.svelte';`
- Tools receive `GlobalState` as a parameter rather than importing it
