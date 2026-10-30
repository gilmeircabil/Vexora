const LOREM_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'curabitur',
  'pretium',
  'tincidunt',
  'lacus',
  'nulla',
  'gravida',
  'orci',
  'a',
  'odio',
  'nullam',
  'varius',
  'turpis',
  'et',
  'commodo',
  'pharetra',
  'est',
  'eros',
  'bibendum',
  'elit',
  'nec',
  'luctus',
  'magna',
  'felis',
  'sollicitudin',
  'mauris',
];

export interface LoremOptions {
  type: 'paragraphs' | 'sentences' | 'words';
  count: number;
  startWithLorem?: boolean;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSentence(startWithLorem = false): string {
  const length = getRandomInt(8, 16);
  const words: string[] = [];

  if (startWithLorem) {
    words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
  }

  while (words.length < length) {
    const word = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]!;
    words.push(word);
  }

  const sentence = words.join(' ');
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
}

function generateParagraph(isFirst = false, startWithLorem = false): string {
  const sentenceCount = getRandomInt(4, 7);
  const sentences: string[] = [];

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(isFirst && i === 0 && startWithLorem));
  }

  return sentences.join(' ');
}

export function generateLorem(options: LoremOptions): string {
  const count = Math.max(1, Math.min(100, options.count));
  const startWithLorem = options.startWithLorem ?? true;

  if (options.type === 'words') {
    const words: string[] = [];
    if (startWithLorem && count >= 5) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    }
    while (words.length < count) {
      words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]!);
    }
    return words.slice(0, count).join(' ');
  }

  if (options.type === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence(i === 0 && startWithLorem));
    }
    return sentences.join(' ');
  }

  // Paragraphs
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(generateParagraph(i === 0, startWithLorem));
  }
  return paragraphs.join('\n\n');
}
