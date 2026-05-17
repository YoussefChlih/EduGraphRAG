export interface TextChunk {
  text: string;
  index: number;
  pageNumber: number;
  metadata: {
    documentId: string;
    startChar: number;
    endChar: number;
  };
}

interface ChunkerOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

const DEFAULT_CHUNK_SIZE = 512;
const DEFAULT_CHUNK_OVERLAP = 50;

/**
 * Splits text into overlapping chunks using a recursive character splitter approach.
 * Tries to split on paragraph boundaries first, then sentences, then words.
 */
export function chunkText(
  text: string,
  documentId: string,
  pageNumber: number,
  options: ChunkerOptions = {}
): TextChunk[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

  const cleanedText = cleanText(text);

  if (cleanedText.length <= chunkSize) {
    return [
      {
        text: cleanedText,
        index: 0,
        pageNumber,
        metadata: { documentId, startChar: 0, endChar: cleanedText.length },
      },
    ];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    let end = start + chunkSize;

    if (end < cleanedText.length) {
      // Try to break at a paragraph boundary
      const paragraphBreak = cleanedText.lastIndexOf("\n\n", end);
      if (paragraphBreak > start + chunkSize * 0.5) {
        end = paragraphBreak;
      } else {
        // Try to break at a sentence boundary
        const sentenceBreak = findLastSentenceBreak(cleanedText, start, end);
        if (sentenceBreak > start + chunkSize * 0.3) {
          end = sentenceBreak;
        } else {
          // Try to break at a word boundary
          const wordBreak = cleanedText.lastIndexOf(" ", end);
          if (wordBreak > start) {
            end = wordBreak;
          }
        }
      }
    } else {
      end = cleanedText.length;
    }

    const chunkText = cleanedText.slice(start, end).trim();
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        index: chunkIndex,
        pageNumber,
        metadata: { documentId, startChar: start, endChar: end },
      });
      chunkIndex++;
    }

    start = end - chunkOverlap;
    if (start >= cleanedText.length) break;
  }

  return chunks;
}

/**
 * Chunks a multi-page document where pages are separated.
 */
export function chunkDocument(
  pages: { text: string; pageNumber: number }[],
  documentId: string,
  options: ChunkerOptions = {}
): TextChunk[] {
  const allChunks: TextChunk[] = [];
  let globalIndex = 0;

  for (const page of pages) {
    const pageChunks = chunkText(page.text, documentId, page.pageNumber, options);
    for (const chunk of pageChunks) {
      allChunks.push({ ...chunk, index: globalIndex });
      globalIndex++;
    }
  }

  return allChunks;
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function findLastSentenceBreak(
  text: string,
  start: number,
  end: number
): number {
  const sentenceEnders = [".", "!", "?", "。", "！", "？"];
  let lastBreak = -1;

  for (let i = end; i > start; i--) {
    if (sentenceEnders.includes(text[i]) && i + 1 < text.length && text[i + 1] === " ") {
      lastBreak = i + 1;
      break;
    }
  }

  return lastBreak;
}
