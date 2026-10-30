# Privacy Architecture & Threat Model

## 1. Local Processing Guarantee

ToolNest guarantees that all tools in the standard release execute locally inside the user's browser:

- Files provided by drag-and-drop or file pickers are read into JavaScript typed arrays (`ArrayBuffer`, `Uint8Array`).
- Image processing (compression, resizing, cropping, rotation) uses native HTML5 Canvas APIs.
- PDF manipulation (merging, splitting, rotation, image-to-PDF) executes via `pdf-lib` in browser memory.
- Text and code manipulation (formatting, diffing, encoding) executes entirely in client-side JavaScript.
- Cryptographic generation (UUIDs, passwords) uses the W3C Web Cryptography API (`crypto.getRandomValues`, `crypto.randomUUID`).

## 2. No Network Transmission of Data

- ToolNest does not maintain an API backend or database for storing user inputs.
- No network requests (`fetch`, `XMLHttpRequest`, `WebSocket`) are initiated with user payload contents.
- Temporary Object URLs created for previewing or downloading files are revoked immediately after use to clean memory.

## 3. Analytics & Telemetry

- No Google Analytics, Mixpanel, Segment, or tracking pixels are embedded.
- No fingerprinting or advertising SDKs exist in the repository.
- No cookies are set by application code.

## 4. Residual Risks & User Environment

While ToolNest does not transmit user data:

- Malicious or compromised browser extensions with access to all website tabs could inspect DOM contents.
- Users operating on shared or public computers should close the browser window after using sensitive utilities (e.g. Password Generator) to ensure memory is released.
