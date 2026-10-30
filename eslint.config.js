import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', '**/dist/**', 'node_modules', '**/node_modules/**', 'Workflow prompt'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);
