# Changelog

All notable changes to ToolNest are documented in this file.

## [0.1.0] - 2026-10-29

### Added

- Initial public release of ToolNest.
- **Phase A Image Tools (7 tools):**
  - Image Compressor (lossy and lossless controls, format transcoding, size metrics).
  - Image Resizer (pixel dimensions, aspect ratio lock, percentage presets).
  - Image Format Converter (PNG, JPEG, WebP transcoding with signature verification).
  - Image Cropper (accessible bounds editor, 1:1, 4:3, 16:9 presets).
  - Image Rotator & Flipper (90° increments, horizontal/vertical mirroring).
  - Color Picker & Eyedropper (native eyedropper, click-to-sample canvas).
  - Image Metadata Viewer (header parsing, dimensions, format inspection).
- **Phase B Text Tools (6 tools):**
  - Word & Character Counter (characters, words, lines, reading time).
  - Case Converter (uppercase, lowercase, title, sentence, camel, kebab, snake).
  - Text Reverser (grapheme-aware emoji and Unicode surrogate preservation).
  - Duplicate Line Remover (deduplication with case and whitespace toggles).
  - Text Diff Checker (unified diff view with added/removed indicators).
  - Lorem Ipsum Generator (configurable paragraphs, sentences, words).
- **Phase C Developer Tools (7 tools):**
  - JSON Formatter & Validator (AST parsing, syntax error line/column reporting, minify).
  - Base64 Encoder & Decoder (UTF-8 text and binary file to Data URI).
  - URL Encoder & Decoder (percent-encoding and decoding).
  - UUID Generator (cryptographically secure v4 UUIDs, bulk generation).
  - Password Generator (Web Crypto, entropy estimation, character classes).
  - HTML Entity Encoder & Decoder (safe entity parsing without DOM injection).
  - CSS Formatter & Beautifier (Prettier standalone AST parser, minifier).
- **Phase D Everyday Utilities (5 tools):**
  - QR Code Generator (PNG and SVG downloads, L/M/Q/H error correction).
  - Percentage Calculator (3 formula types, division by zero handling).
  - Unit Converter (length, mass, temperature, area, volume).
  - Date Difference Calculator (UTC calendar days, business days, weeks, months).
  - Color Converter (HEX, RGB, HSL conversions, WCAG contrast calculation).
- **Phase E PDF Tools (5 tools):**
  - PDF Merger (pdf-lib multi-document merging with reordering).
  - PDF Page Extractor & Splitter (custom page range extraction).
  - PDF Rotator (90°, 180°, 270° document page rotation).
  - Image to PDF Converter (multi-image to multi-page PDF generation).
  - PDF Viewer & Inspector (PDF.js rendering with zoom and pagination).
- Full suite of Vitest unit and component tests (61 tests passing).
- Playwright end-to-end browser test configuration.
- Comprehensive documentation: ARCHITECTURE, PRIVACY, DEPLOYMENT, ADDING_A_TOOL, LICENSE_AUDIT.
