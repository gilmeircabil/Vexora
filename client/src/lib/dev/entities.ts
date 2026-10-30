import * as entities from 'entities';

export interface EntityOptions {
  mode?: 'special' | 'nonAscii' | 'extensive';
}

/**
 * Encodes special HTML characters into entities without injecting anything into DOM.
 */
export function encodeHtmlEntities(text: string, options: EntityOptions = {}): string {
  if (!text) return '';

  if (options.mode === 'nonAscii') {
    return entities.encodeNonAsciiHTML(text);
  }

  if (options.mode === 'extensive') {
    return entities.encodeHTML(text);
  }

  // Default: encode XML/HTML critical characters (&, <, >, ", ')
  return entities.escapeUTF8(text);
}

/**
 * Decodes HTML entities back to plain text safely using pure parsing.
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return entities.decodeHTML(text);
}
