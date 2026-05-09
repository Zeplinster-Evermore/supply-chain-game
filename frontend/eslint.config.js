import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from "eslint-plugin-import";
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"], "object", "type"],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "react-router-dom", group: "external", position: "before" },
            { pattern: "{socket.io-client,express}", group: "external", position: "after" },
            { pattern: "../views/**", group: "internal", position: "before" },
            { pattern: "../styles/**", group: "internal", position: "after" },
            { pattern: "*.css", group: "index", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        }
      ]
    }
  },
])
