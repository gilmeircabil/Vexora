You are a senior engineer doing a "minimal code" audit of this project.

GOAL
Make the project as small and simple as possible while keeping the EXACT same
behavior, output, and UI. Remove everything that is not needed.

STEP 1: UNDERSTAND (do not edit anything yet)
- Read the project structure, entry points, routes, and package/config files.
- Write a short list of what the project actually does (pages, features, API
  endpoints). This is the "must keep" list.
- Find out how to build/run/test it (npm run build, npm test, etc.) and run it
  once to confirm the current state works.

STEP 2: AUDIT
Find and list, with file paths and line numbers:
1. Dead code: unused files, components, functions, variables, imports, exports,
   CSS classes, routes, and assets (images, fonts).
2. Unused dependencies in package.json / requirements.txt / etc.
3. Duplicate code: same logic written 2+ times that can become one function
   or component.
4. Over-engineering: unnecessary abstractions, wrappers, config layers, state
   management, or helper files used only once.
5. Useless comments, console.logs, commented-out code, placeholder/example
   code, and leftover boilerplate.
6. Verbose code that can be written shorter with the same result (long
   if/else chains, manual loops that map/filter can replace, repeated styles,
   etc.).
7. Features that were added but are not used anywhere in the project.

For each finding, label confidence: SAFE (100% unused), LIKELY, or UNSURE.

STEP 3: REPORT
Show me a table: file | problem | proposed fix | confidence | lines saved.
Give a total estimate of lines/files/dependencies removed.

STEP 4: APPLY
After the report, apply all SAFE and LIKELY changes directly to the project.
- Do NOT apply UNSURE items. List them and ask me.
- Do not change behavior, visible UI, API responses, or data formats.
- Do not rename public things (routes, API fields, env vars) unless unused.
- Do not add new features or new dependencies.
- Prefer deleting over rewriting. Prefer simple over clever. Do not sacrifice
  readability just to save characters.
- Keep the existing code style and framework.

STEP 5: VERIFY
- Re-run build, lint, and tests. Fix anything I broke.
- Confirm every item in the "must keep" list still works.
- Give me a final summary: files deleted, lines before vs. after,
  dependencies removed, and anything I should manually test.

RULES
- If you are not sure something is unused (dynamic imports, reflection,
  string-based routes, env-based features), mark it UNSURE and ask.
- Work in small steps, and tell me before any large deletion.