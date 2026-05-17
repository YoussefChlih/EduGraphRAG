/**
 * Embedding generation using HuggingFace Inference API with BGE-M3 model.
 * Supports multilingual text (English, French, Arabic).
 */

const EMBEDDING_API_URL =
  process.env.EMBEDDING_API_URL ||
  "https://api-inference.huggingface.co/models/BAAI/bge-m3";

export async function generateEmbedding(text: string): Promise<number[]> {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    throw new Error("Missing HF_API_TOKEN environment variable");
  }

  const response = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: text,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Embedding API error (${response.status}): ${errorText}`
    );
  }

  const result = await response.json();

  // HuggingFace returns either a flat array or nested array
  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as number[];
  }
  return result as number[];
}

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    throw new Error("Missing HF_API_TOKEN environment variable");
  }

  const response = await fetch(EMBEDDING_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Embedding API error (${response.status}): ${errorText}`
    );
  }

  const result = await response.json();
  return result as number[][];
}
