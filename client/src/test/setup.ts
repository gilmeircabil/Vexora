import '@testing-library/jest-dom';

// Polyfill URL.createObjectURL and revokeObjectURL in JSDOM environment
if (typeof window !== 'undefined') {
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = (blob: Blob | MediaSource) => {
      return `blob:test-${Math.random().toString(36).substring(2, 9)}`;
    };
  }
  if (!window.URL.revokeObjectURL) {
    window.URL.revokeObjectURL = () => {
      // noop in test
    };
  }
}
