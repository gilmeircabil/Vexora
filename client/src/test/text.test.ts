import { describe, it, expect } from 'vitest';
import { analyzeText } from '../lib/text/counter.js';
import { convertCasing } from '../lib/text/casing.js';
import { reverseText } from '../lib/text/reverse.js';
import { removeDuplicateLines } from '../lib/text/dedupe.js';
import { computeTextDiff } from '../lib/text/diff.js';
import { generateLorem } from '../lib/text/lorem.js';

describe('Word and Character Counter', () => {
  it('handles empty and whitespace-only text accurately', () => {
    expect(analyzeText('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    });

    const spaces = analyzeText('   \n  \t  ');
    expect(spaces.words).toBe(0);
    expect(spaces.charactersNoSpaces).toBe(0);
    expect(spaces.characters).toBe(9);
  });

  it('counts words and sentences with Unicode awareness', () => {
    const text = 'Hello world! ToolNest is great.\nAnother line.';
    const stats = analyzeText(text);
    expect(stats.words).toBe(7);
    expect(stats.lines).toBe(2);
    expect(stats.paragraphs).toBe(1);
  });
});

describe('Case Converter', () => {
  it('converts to UPPERCASE and lowercase', () => {
    expect(convertCasing('hello world', 'upper')).toBe('HELLO WORLD');
    expect(convertCasing('HELLO WORLD', 'lower')).toBe('hello world');
  });

  it('converts to Title Case and Sentence case', () => {
    expect(convertCasing('quick brown fox', 'title')).toBe('Quick Brown Fox');
    expect(convertCasing('hello world. this is a test!', 'sentence')).toBe(
      'Hello world. This is a test!',
    );
  });

  it('converts to camelCase, kebab-case, and snake_case', () => {
    expect(convertCasing('user first name', 'camel')).toBe('userFirstName');
    expect(convertCasing('User First Name', 'kebab')).toBe('user-first-name');
    expect(convertCasing('User First Name', 'snake')).toBe('user_first_name');
  });
});

describe('Text Reverser with Unicode preservation', () => {
  it('reverses characters safely without corrupting surrogate pairs', () => {
    // String with complex emoji (surrogate pairs)
    const str = 'abc 🚀 def';
    const rev = reverseText(str, 'characters');
    expect(rev).toBe('fed 🚀 cba');
  });

  it('reverses word order while keeping lines', () => {
    const str = 'first second third\none two';
    const rev = reverseText(str, 'words');
    expect(rev).toBe('third second first\ntwo one');
  });
});

describe('Duplicate Line Remover', () => {
  it('removes duplicate lines preserving first occurrence', () => {
    const input = 'apple\nbanana\napple\norange\nbanana';
    const res = removeDuplicateLines(input);
    expect(res.uniqueLines).toBe(3);
    expect(res.removedCount).toBe(2);
    expect(res.text).toBe('apple\nbanana\norange');
  });

  it('respects case-insensitivity option', () => {
    const input = 'Apple\napple\nAPPLE';
    const sensitive = removeDuplicateLines(input, { caseSensitive: true });
    expect(sensitive.uniqueLines).toBe(3);

    const insensitive = removeDuplicateLines(input, { caseSensitive: false });
    expect(insensitive.uniqueLines).toBe(1);
    expect(insensitive.text).toBe('Apple');
  });
});

describe('Text Diff', () => {
  it('identifies added, removed, and unchanged lines', () => {
    const v1 = 'line 1\nline 2\nline 3';
    const v2 = 'line 1\nline two\nline 3\nline 4';
    const diff = computeTextDiff(v1, v2);

    expect(diff.some((p) => p.added && p.value.includes('line two'))).toBe(true);
    expect(diff.some((p) => p.removed && p.value.includes('line 2'))).toBe(true);
  });
});

describe('Lorem Ipsum Generator', () => {
  it('generates paragraphs starting with Lorem ipsum', () => {
    const lorem = generateLorem({ type: 'paragraphs', count: 2, startWithLorem: true });
    expect(lorem.startsWith('Lorem ipsum dolor sit amet')).toBe(true);
    expect(lorem.split('\n\n').length).toBe(2);
  });

  it('respects count boundaries', () => {
    const words = generateLorem({ type: 'words', count: 10 });
    expect(words.split(' ').length).toBe(10);
  });
});
