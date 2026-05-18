export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Kwiz_y",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  languages: ["en", "fr", "ar"] as const,
} as const;

export type SupportedLanguage = (typeof config.languages)[number];
