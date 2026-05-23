import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/**",
    "ws-server.js",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any":        "warn",
      "@next/next/no-img-element":                 "warn",
      "react-hooks/exhaustive-deps":               "warn",
      "react-hooks/set-state-in-effect":           "warn",
      // React Compiler (experimental) — false positives in regular async functions
      "react-hooks/purity":                        "off",
      "react-hooks/refs":                          "warn",
    },
  },
]);

export default eslintConfig;
