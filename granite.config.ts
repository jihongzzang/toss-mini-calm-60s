import {defineConfig} from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "mini-calm-60s",
  brand: {
    displayName: "감정리셋 60초",
    primaryColor: "#0064FF",
    icon: "https://static.toss.im/appsintoss/3969/4fa5cff9-00ab-4692-ac8e-0d4861c36ce0.png",
  },
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },
  web: {
    host: "192.168.35.248",
    port: 5173,
    commands: {
      dev: "vite --host",
      build: "tsc -b && vite build",
    },
  },
  outdir: "dist",
  permissions: [],
});
