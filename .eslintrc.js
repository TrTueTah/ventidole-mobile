module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['import'],
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
 "settings": {
    "import/resolver": {
      "typescript": true,
      "node": true,
    },
  },
  rules: {
    'import/no-unresolved': 'error',
  },
  // ignore all js files
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    "coverage/",
    "**/*.d.ts",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js",
    "jest/jest-svg-transformer.js",
    "functions/index.js",
  ],
};
