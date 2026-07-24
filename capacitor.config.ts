import type { CapacitorConfig } from "@capacitor/cli";

const mobileServerUrl =
  process.env.CAPACITOR_SERVER_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.zerinix.app",
  appName: "ZERINIX",
  webDir: "capacitor-web",
  server: mobileServerUrl
    ? {
        url: mobileServerUrl,
        cleartext: false,
      }
    : undefined,
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
