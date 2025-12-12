import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://boune.dev",

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: cloudflare(),
});
