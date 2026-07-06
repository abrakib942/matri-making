import baseConfig from '../../packages/eslint-config/eslint.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    // Simple Express/Node config without type-aware rules
    // Keep basic TypeScript and security rules from base config
  },
];
