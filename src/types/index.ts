// Document types
export interface Document {
  id: string;
  title: string;
  filename: string;
  language: string;
  uploadedAt: string;
  pageCount: number;
  chunkCount: number;
  status: "processing" | "ready" | "error";
}

// Chunk types
export interface Chunk {
  id: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
  documentId: string;
  embedding?: number[];
}

// Concept types
export interface Concept {
  id: string;
  name: string;
  description: string;
  language?: string;
}

// Relationship types
export type RelationType =
  | "RELATED_TO"
  | "PREREQUISITE_OF"
  | "PART_OF"
  | "EXAMPLE_OF"
  | "CONTRASTS_WITH";

export interface Relationship {
  source: string;
  target: string;
  type: RelationType;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  timestamp: string;
}

export interface ChatSource {
  documentTitle: string;
  pageNumber: number;
  text: string;
  score: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// Graph visualization types
export interface GraphNode {
  id: string;
  label: string;
  type: "concept" | "document" | "chunk";
  description?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
