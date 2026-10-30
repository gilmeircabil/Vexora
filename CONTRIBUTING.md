# Contributing to ToolNest

Thank you for your interest in improving ToolNest!

## Guiding Principles

1. **Local-First Always:** All tools must operate in the user's browser. Do not introduce servers, paid APIs, or third-party webhooks.
2. **Real Implementations Only:** We never ship mockups, non-functioning buttons, or fake progress bars.
3. **Strict TypeScript:** No `any`. Return typed `Result<T, E>` from domain functions.
4. **Accessible UI:** Ensure keyboard accessibility, visible focus rings, and proper ARIA labels.

## Adding a New Tool

Follow our guide in [`docs/ADDING_A_TOOL.md`](docs/ADDING_A_TOOL.md) to register, implement, test, and style a new utility.

## Development Workflow

1. Fork and clone the repository.
2. Install dependencies: `npm install`.
3. Create a branch: `git checkout -b feature/your-tool-name`.
4. Run tests: `npm run test`.
5. Run typechecking: `npm run typecheck`.
6. Run linting: `npm run lint`.
7. Submit a clean Pull Request.
