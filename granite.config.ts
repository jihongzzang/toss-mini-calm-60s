import {defineConfig} from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mini-calm-60s",
  brand: {
    displayName: "감정리셋 60초",
    primaryColor: "#64C9A0",
    icon: "https://static.toss.im/appsintoss/3969/d412a1e4-d102-4ff8-a97d-ab48e802fa04.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite",
      build: "vite build",
    },
  },
  outdir: "dist",
  permissions: [],
});
