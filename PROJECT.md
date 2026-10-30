# PROJECT.md

ToolNest — everyday tools. One place. No cost.
Free, open-source, private, all-in-one local-first online tools platform.

## Stack

- Node >= 20.19
- React 19, React Router 7, Vite 6, Tailwind CSS 4, Lucide React
- pdf-lib, pdfjs-dist, qrcode, diff, entities, prettier, zod
- Vitest 3, React Testing Library, Playwright

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm run test`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Format: `npm run format` / `npm run format:check`

## Architecture

- `src/tools/`: Central typed catalog and lazy-loading component registry
- `src/lib/`: Pure domain algorithms (images, text, developer, calculators, pdf, files) returning `Result<T, E>`
- `src/features/`: Category-separated tool implementations with progress, before/after previews, and downloads
- `src/components/`: Reusable accessible UI components (Button, Card, FileDropZone, CopyButton, DownloadButton, Layout)
- `src/pages/`: Route endpoints (Home, Directory, Category, Tool detail, About, Privacy, Licenses, Contributing, 404)
- `src/test/`: Comprehensive unit and component tests

## Conventions

- Typed `Result<T, E>` return values from all calculations: `src/lib/result.ts`
- Zero server uploads: All processing runs in-browser (Canvas, Web Workers, Web Crypto, WebAssembly)
- Explicit URL cleanup via `createTrackedBlobUrl` and `revokeTrackedBlobUrl` to avoid memory leaks: `src/lib/files/blob.ts`
- Magic-byte verification of all inputs and outputs: `src/lib/files/signatures.ts`

## Hard Rules

- Never use third-party paid APIs or transmit user files over the network
- No tracking cookies, analytics pixels, or mandatory accounts
- Never evaluate arbitrary code with `eval` or `Function`
- Never claim a tool or feature works without a real implementation and test coverage
