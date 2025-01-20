import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

const eslintConfig = [
  {
    ignores: ["**/dist/*"],
  },
  {
    files: ["**/src/**/*.{js,ts}"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "eslint-config-prettier": eslintConfigPrettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: typescriptParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
