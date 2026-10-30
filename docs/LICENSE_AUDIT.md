# Open-Source License Audit

This document inventories all direct production and development dependencies used in ToolNest and audits their respective licenses.

## Production Dependencies

| Package        | Version | License      | Source / Purpose                                               |
| -------------- | ------- | ------------ | -------------------------------------------------------------- |
| `react`        | 19.x    | MIT          | Core UI component framework                                    |
| `react-dom`    | 19.x    | MIT          | React DOM renderer                                             |
| `react-router` | 7.x     | MIT          | Declarative SPA client-side routing                            |
| `lucide-react` | 1.x     | ISC          | Accessible SVG iconography                                     |
| `pdf-lib`      | 1.x     | MIT          | In-browser PDF manipulation (merge, split, rotate, imageToPdf) |
| `pdfjs-dist`   | 4.x     | Apache-2.0   | In-browser PDF rendering for preview                           |
| `qrcode`       | 1.x     | MIT          | Client-side QR code generator                                  |
| `diff`         | 7.x     | BSD-3-Clause | Text difference and line comparison                            |
| `entities`     | 6.x     | BSD-2-Clause | HTML entity encoding and decoding                              |
| `prettier`     | 3.x     | MIT          | In-browser AST parser for CSS formatting                       |
| `zod`          | 3.x     | MIT          | Schema validation                                              |

## Development Dependencies

| Package                  | Version | License    | Purpose                          |
| ------------------------ | ------- | ---------- | -------------------------------- |
| `vite`                   | 6.x     | MIT        | Build tool and dev server        |
| `@vitejs/plugin-react`   | 4.x     | MIT        | Fast refresh for React           |
| `tailwindcss`            | 4.x     | MIT        | Utility-first CSS styling        |
| `@tailwindcss/vite`      | 4.x     | MIT        | Vite plugin for Tailwind v4      |
| `typescript`             | 5.x     | Apache-2.0 | Strict typechecking              |
| `vitest`                 | 3.x     | MIT        | Fast unit test runner            |
| `@testing-library/react` | 16.x    | MIT        | Component test utilities         |
| `jsdom`                  | 26.x    | MIT        | DOM environment for unit testing |
| `eslint`                 | 9.x     | MIT        | Linter                           |
| `typescript-eslint`      | 8.x     | MIT        | TypeScript rules for ESLint      |
| `@playwright/test`       | 1.x     | Apache-2.0 | End-to-end browser testing       |

## Summary

All dependencies use permissive licenses (MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC). There are no GPL, AGPL, copyleft, or proprietary components in the distribution.
