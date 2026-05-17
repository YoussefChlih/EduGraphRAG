/**
 * PDF text extraction utility.
 * Uses unpdf with worker disabled for Next.js server compatibility.
 */

import { getResolvedPDFJS } from "unpdf";

export interface ParsedPDF {
  pages: { text: string; pageNumber: number }[];
  totalPages: number;
  fullText: string;
}

/**
 * Extract text from a PDF buffer without using Web Workers.
 * This avoids DataCloneError in Next.js server environment.
 */
export async function parsePDF(data: Uint8Array): Promise<ParsedPDF> {
  const pdfjs = await getResolvedPDFJS();

  // Disable worker to avoid DataCloneError in server environment
  pdfjs.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjs.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  });

  const doc = await loadingTask.promise;
  const totalPages = doc.numPages;
  const pages: { text: string; pageNumber: number }[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is { str: string } => "str" in item)
      .map((item) => item.str)
      .join(" ");
    pages.push({ text, pageNumber: i });
  }

  await doc.destroy();

  const fullText = pages.map((p) => p.text).join("\n");

  return { pages, totalPages, fullText };
}
