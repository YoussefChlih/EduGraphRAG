import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type LLMProvider = "groq" | "openai";

interface LLMOptions {
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const DEFAULT_GROQ_MODEL = "llama-3.1-70b-versatile";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/**
 * Get an LLM client. Defaults to Groq for fast inference, falls back to OpenAI.
 */
export function getLLM(options: LLMOptions = {}): BaseChatModel {
  const provider = options.provider ?? getDefaultProvider();
  const temperature = options.temperature ?? 0.1;
  const maxTokens = options.maxTokens ?? 2048;

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY environment variable");
    }
    return new ChatGroq({
      apiKey,
      model: options.model ?? DEFAULT_GROQ_MODEL,
      temperature,
      maxTokens,
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  return new ChatOpenAI({
    apiKey,
    model: options.model ?? DEFAULT_OPENAI_MODEL,
    temperature,
    maxTokens,
  });
}

/**
 * Get a smaller/faster LLM for entity extraction tasks.
 */
export function getExtractionLLM(): BaseChatModel {
  return getLLM({
    model: "llama-3.1-8b-instant",
    temperature: 0,
    maxTokens: 4096,
  });
}

function getDefaultProvider(): LLMProvider {
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.OPENAI_API_KEY) return "openai";
  throw new Error("No LLM API key configured. Set GROQ_API_KEY or OPENAI_API_KEY.");
}
