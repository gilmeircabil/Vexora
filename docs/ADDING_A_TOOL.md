# Adding a New Tool to ToolNest

This guide walks through the step-by-step process of adding a new utility to ToolNest.

## Step 1: Register Tool in Catalog

Open `src/tools/catalog.ts` and append a new `ToolDefinition` to `TOOL_CATALOG`:

```typescript
{
  id: 'my-new-tool',
  slug: 'my-new-tool',
  name: 'My New Tool',
  tagline: 'Concise one-line summary of what this tool does.',
  description: 'Detailed explanation of inputs, processing, and output.',
  category: 'utilities', // 'images' | 'text' | 'developer' | 'utilities' | 'pdf'
  keywords: ['keyword1', 'keyword2'],
  iconName: 'Wrench', // Any Lucide icon name
  supportedInputTypes: ['text/plain'],
  processingLocation: 'browser',
  status: 'available',
  privacyNotice: 'Processed entirely on your device.',
}
```

## Step 2: Implement Domain Logic & Unit Tests

Create your pure calculation logic under `src/lib/<domain>/yourLogic.ts`.
Always return a `Result<T, E>`:

```typescript
import { Result, ok, err } from '../result.js';

export function calculateSomething(input: number): Result<number, string> {
  if (input < 0) return err('Input must be non-negative.');
  return ok(input * 2);
}
```

Add unit tests in `src/test/<domain>.test.ts` to verify functionality and edge cases.

## Step 3: Build the Accessible UI Component

Create `src/features/<category>/MyNewTool.tsx`:

- Use `Card`, `Button`, `CopyButton`, or `DownloadButton`.
- Provide input validation and clear error states.
- Display accessible ARIA labels.

## Step 4: Register in Component Map

Add your component to `src/tools/registry.ts`:

```typescript
'my-new-tool': lazy(() =>
  import('../features/utilities/MyNewTool.js').then((m) => ({ default: m.MyNewTool })),
),
```

## Step 5: Verify Quality Checks

Run the build and test scripts:

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```
