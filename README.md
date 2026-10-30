# Vexora - ToolNest

> **Everyday tools. One place. No cost.**

Vexora - ToolNest is a free, open-source, hybrid utility platform containing 33 indispensable tools for images, PDFs, text manipulation, developers, everyday calculations, and premium AI-powered tools powered by a 2-phase atomic credit engine.

---

## Key Features

- **Local-First Core:** 32 standard utilities run 100% in your browser using HTML5 Canvas, Web Crypto, WebAssembly, and PDF-Lib. Zero registration required for ordinary tools.
- **Credit-Based AI Architecture:** Daily free AI generation credits (3 credits/day, automatic 00:00 UTC server-side reset) and Pro (300/mo) / Premium (1,000/mo) subscription tiers.
- **Two-Phase Atomic Credit Reservation:** Prevents concurrent overspending and guarantees full automatic refund if an AI operation fails.
- **Pluggable Payment Integration:** Multi-provider abstraction supporting Stripe, PayMongo (GCash, Maya, cards in SEA), and Sandbox mode with verified HMAC webhooks and duplicate replay protection.
- **Admin & User Dashboards:** Responsive credit indicator in navigation, user dashboard with usage history, and secure role-protected admin console.
- **Modern Full-Stack Architecture:** React 19, TypeScript strict mode, Vite 6, Tailwind CSS v4, Node.js, Express, MongoDB (Mongoose), and Vitest.

---

## Implemented Tools

### Image Tools

1. **Image Compressor:** Compress PNG, JPEG, and WebP with custom quality, format transcoding, and percentage reduction comparison.
2. **Image Resizer:** Scale images to exact dimensions or percentage with aspect ratio lock.
3. **Image Format Converter:** Convert raster images between PNG, JPEG, and WebP with content verification.
4. **Image Cropper:** Accessible crop interface with freeform and 1:1, 4:3, 16:9 aspect ratio presets.
5. **Image Rotator & Flipper:** 90° clockwise/counter-clockwise rotation and horizontal/vertical mirroring.
6. **Color Picker & Eyedropper:** Native browser eyedropper and click-to-sample canvas inspector from user images.
7. **Image Metadata Viewer:** Fast client-side image header parser showing dimensions, format, MIME, and size.
8. **Background Remover:** Client-side background removal using color-keying, contiguous flood-fill, and edge feathering with transparent PNG export.
9. **AI Image Enhancer:** Neural super-resolution upscaling, face restoration, and noise reduction with credit management.

### Text Tools

9. **Word & Character Counter:** Real-time character, word, line, paragraph, and reading time statistics.
10. **Case Converter:** Transform text into UPPERCASE, lowercase, Title Case, Sentence case, camelCase, kebab-case, snake_case.
11. **Text Reverser:** Grapheme-cluster aware reversing by character or word, preventing emoji corruption.
12. **Duplicate Line Remover:** Deduplicate lines preserving first occurrence with case and whitespace toggles.
13. **Text Diff Checker:** Unified line-by-line visual difference tool highlighting additions and deletions.
14. **Lorem Ipsum Generator:** Generate placeholder paragraphs, sentences, or words for UI design.

### Developer Tools

15. **JSON Formatter & Validator:** AST parse, minify, pretty-print (2/4 spaces, tabs) with descriptive error line/column reporting.
16. **Base64 Encoder & Decoder:** UTF-8 text encoder/decoder and binary file to Data URI generator.
17. **URL Encoder & Decoder:** Percent-encode and decode URI components with malformed sequence alerts.
18. **UUID / GUID Generator:** Cryptographically secure RFC 4122 v4 UUID generator using Web Crypto API.
19. **Password Generator:** High-entropy password generator with custom character classes and entropy estimation.
20. **JWT Generator & Debugger:** Create, sign, decode, and verify JSON Web Tokens with HS256/384/512 using Web Crypto HMAC.
21. **HTML Entity Encoder & Decoder:** XML/HTML entity escaping and decoding without DOM injection risks.
22. **CSS Formatter & Beautifier:** AST-based CSS beautification and minification via Prettier standalone.

### Everyday Utilities

23. **QR Code Generator:** Generate downloadable PNG and vector SVG QR codes with error-correction levels (L, M, Q, H).
24. **Percentage Calculator:** Three-in-one calculator for percentage of value, ratio, and percentage change.
25. **Unit Converter:** Convert between metric and imperial units for length, mass, temperature, area, and volume.
26. **Date Difference Calculator:** Calculate elapsed calendar days, weeks, months, and business days between UTC dates.
27. **Color Converter:** Multi-format conversion between HEX, RGB, and HSL with WCAG contrast ratio analysis.

### PDF Tools

28. **PDF Merger:** Combine multiple PDF documents into a single document with drag/button reordering.
29. **PDF Page Extractor & Splitter:** Extract custom page ranges (e.g. `1-3, 5`) into a downloadable PDF.
30. **PDF Rotator:** Rotate all pages of a PDF by 90°, 180°, or 270°.
31. **Image to PDF Converter:** Transform multiple PNG, JPEG, and WebP images into a multi-page PDF document.
32. **PDF Viewer & Inspector:** Client-side PDF page preview powered by PDF.js with zoom and pagination.

---

## Development and Build Commands

```bash
# Install dependencies
npm install

# Start local dev server (http://localhost:3000)
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run unit and component test suite (Vitest)
npm run test

# Run ESLint
npm run lint

# Check code formatting (Prettier)
npm run format:check

# Format codebase
npm run format

# Production build
npm run build

# Preview production build locally (http://localhost:4173)
npm run preview
```

---

## Privacy & Security

ToolNest operates strictly on a **local-first** security model:

- No file or sensitive text leaves your browser.
- No third-party tracking scripts, cookies, or remote analytics.
- Web Crypto API (`crypto.getRandomValues`, `crypto.randomUUID`) is used exclusively for secrets.
- Passwords and private documents are never written to `localStorage` or `sessionStorage`.

---

## License

ToolNest is open-source software licensed under the [MIT License](LICENSE).
Third-party libraries retain their respective permissive licenses (see [docs/LICENSE_AUDIT.md](docs/LICENSE_AUDIT.md)).
