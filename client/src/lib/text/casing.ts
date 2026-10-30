export type CasingType =
  'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'kebab' | 'snake' | 'pascal';

export function convertCasing(text: string, type: CasingType): string {
  if (!text) return '';

  switch (type) {
    case 'upper':
      return text.toUpperCase();

    case 'lower':
      return text.toLowerCase();

    case 'title':
      // Title Case: capitalize the first letter of each word
      return text.replace(/\b(\p{L})(\p{L}*)/gu, (_, first, rest) => {
        return first.toUpperCase() + rest.toLowerCase();
      });

    case 'sentence':
      // Sentence case: capitalize after start or punctuation (. ! ?)
      return text.toLowerCase().replace(/(^\s*|\.\s*|\?\s*|!\s*)(\p{L})/gu, (_, prefix, char) => {
        return prefix + char.toUpperCase();
      });

    case 'camel': {
      const words = text
        .trim()
        .split(/[\s_\-]+|(?=[A-Z])/)
        .filter(Boolean);
      if (words.length === 0) return '';
      return words
        .map((w, i) => {
          const lower = w.toLowerCase();
          return i === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
    }

    case 'pascal': {
      const words = text
        .trim()
        .split(/[\s_\-]+|(?=[A-Z])/)
        .filter(Boolean);
      return words
        .map((w) => {
          const lower = w.toLowerCase();
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
    }

    case 'kebab': {
      return text
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase()
        .replace(/[^a-z0-9\-]/g, '');
    }

    case 'snake': {
      return text
        .trim()
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s\-]+/g, '_')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '');
    }

    default:
      return text;
  }
}
