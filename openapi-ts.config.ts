import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "https://developer.bling.com.br/build/assets/openapi-668352d1.json",
  output: {
    format: "prettier",
    path: "src/client",
  },
  plugins: ["@hey-api/client-axios"],
});
