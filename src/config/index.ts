export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Kwiz_y",
  },
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || "20", 10),
    allowedTypes: ["application/pdf"],
  },
  chunking: {
    chunkSize: parseInt(process.env.CHUNK_SIZE || "512", 10),
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || "50", 10),
  },
  retrieval: {
    topK: 5,
    graphHops: 2,
  },
  languages: ["en", "fr", "ar"] as const,
} as const;

export type SupportedLanguage = (typeof config.languages)[number];
