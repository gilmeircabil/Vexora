# Security Policy

## Reporting Security Issues

If you discover a security vulnerability or potential threat in ToolNest, please report it responsibly by opening a confidential GitHub Security Advisory or submitting an issue.

## Threat Model & Security Posture

ToolNest is a purely client-side static web application (SPA). Its security properties include:

- **No Remote Processing:** No user documents, images, or texts are transmitted across the network.
- **Web Crypto:** Secure pseudo-random number generation utilizes browser `crypto.getRandomValues()` and `crypto.randomUUID()`.
- **Content Security Policy (CSP):** The application restricts script execution to self, disallowing external executable script injections.
- **Sanitized DOM:** Content like HTML entities and JSON inputs are parsed without `eval()` or injecting raw markup into `innerHTML`.
- **Zero Local Persistence:** Passwords and uploaded files are kept in volatile memory only and are discarded upon page reload or navigation.

## Known Boundaries & Residual Risks

Because processing occurs in the browser:

- Malicious browser extensions or malware on the host machine with DOM read permissions could inspect page contents.
- Users handling sensitive documents should ensure their browser environment is up to date and free of unverified extensions.
