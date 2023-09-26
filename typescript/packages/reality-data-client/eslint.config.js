const iTwinPlugin = require("@itwin/eslint-plugin");

module.exports = [
    {
      files: ["**/*.{ts,tsx}"],
      ...iTwinPlugin.configs.iTwinjsRecommendedConfig,
    },
    {
      files: ["**/*.{ts,tsx}"],
      ...iTwinPlugin.configs.jsdocConfig,
    },
    {
      rules: {
          "@typescript-eslint/no-duplicate-imports": "error",
          "@typescript-eslint/consistent-type-imports": "error"
        }
    }
  ];