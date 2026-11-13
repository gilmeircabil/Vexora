export type CasingType =
  | 'upper'
  | 'lower'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'kebab'
  | 'snake'
  | 'pascal';

// Helper function to split text into individual words
function getWords(text: string): string[] {
  // Insert a space before capital letters in camelCase (e.g. "myVar" -> "my Var")
  const separated = text.replace(/([a-z])([A-Z])/g, '$1 $2');
  const tokens = separated.trim().split(/[\s_\-]+/);

  const words: string[] = [];
  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed.length > 0) {
      words.push(trimmed);
    }
  }
  return words;
}

export function convertCasing(text: string, type: CasingType): string {
  if (!text) {
    return '';
  }

  switch (type) {
    case 'upper':
      return text.toUpperCase();

    case 'lower':
      return text.toLowerCase();

    case 'title':
      // Capitalize the first letter of each word
      return text.replace(/\b(\p{L})(\p{L}*)/gu, (_match, first, rest) => {
        return first.toUpperCase() + rest.toLowerCase();
      });

    case 'sentence':
      // Capitalize the first letter at the start of text and after sentence-ending punctuation (. ! ?)
      return text.toLowerCase().replace(/(^\s*|[.!?]\s*)(\p{L})/gu, (_match, prefix, char) => {
        return prefix + char.toUpperCase();
      });

    case 'camel': {
      const words = getWords(text);
      if (words.length === 0) {
        return '';
      }
      const firstWord = words[0] || '';
      let result = firstWord.toLowerCase();
      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        if (word) {
          const lower = word.toLowerCase();
          result += lower.charAt(0).toUpperCase() + lower.slice(1);
        }
      }
      return result;
    }

    case 'pascal': {
      const words = getWords(text);
      let result = '';
      for (const word of words) {
        const lower = word.toLowerCase();
        result += lower.charAt(0).toUpperCase() + lower.slice(1);
      }
      return result;
    }

    case 'kebab': {
      const words = getWords(text);
      const cleanWords: string[] = [];
      for (const word of words) {
        const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleaned.length > 0) {
          cleanWords.push(cleaned);
        }
      }
      return cleanWords.join('-');
    }

    case 'snake': {
      const words = getWords(text);
      const cleanWords: string[] = [];
      for (const word of words) {
        const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleaned.length > 0) {
          cleanWords.push(cleaned);
        }
      }
      return cleanWords.join('_');
    }

    default:
      return text;
  }
}
