import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import preact from "@astrojs/preact";

const site =
  process.env.PUBLIC_SITE_URL ??
  (process.env.CF_PAGES_URL ? `https://${process.env.CF_PAGES_URL}` : "https://ccpoke.pages.dev");
const base = process.env.PUBLIC_BASE_PATH ?? "/";

export default defineConfig({
  output: "static",
  site,
  base,
  integrations: [preact()],
  vite: {
    plugins: [tailwindcss()],
  },
});
