import * as prettier from 'prettier/standalone';
import * as postcssPlugin from 'prettier/plugins/postcss';
import { Result, ok, err } from '../result.js';

export interface CssFormatOptions {
  tabWidth?: number;
  useTabs?: boolean;
}

export async function formatCss(
  cssText: string,
  options: CssFormatOptions = {},
): Promise<Result<string, string>> {
  const trimmed = cssText.trim();
  if (!trimmed) {
    return ok('');
  }

  try {
    const formatted = await prettier.format(trimmed, {
      parser: 'css',
      plugins: [postcssPlugin],
      tabWidth: options.tabWidth ?? 2,
      useTabs: options.useTabs ?? false,
    });
    return ok(formatted);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid CSS syntax.';
    return err(message);
  }
}

export function minifyCss(cssText: string): Result<string, string> {
  const trimmed = cssText.trim();
  if (!trimmed) return ok('');

  try {
    // Strip comments, collapse whitespace, strip spaces around { } : ;
    const minified = trimmed
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
      .replace(/\s+/g, ' ') // collapse multi-spaces
      .replace(/\s*([\{\}:;,>+~])\s*/g, '$1') // remove spaces around symbols
      .replace(/;}/g, '}') // remove trailing semicolons before closing brace
      .trim();

    return ok(minified);
  } catch (e) {
    return err('Failed to minify CSS.');
  }
}
