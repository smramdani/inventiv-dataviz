// ESLint 9+ flat config — lint JS only; TS files are type-checked by the build.
module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".tmp/**",
      "**/dist/**",
      "demo/dist/**",
      "test-results/**",
      "playwright-report/**",
      "playwright/.cache/**",
      "*.pbiviz",
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "writable",
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
