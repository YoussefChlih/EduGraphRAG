# Agent Guidelines

## Code Conventions

### General
- TypeScript strict mode
- Functional components with hooks (React)
- Named exports preferred
- Descriptive variable names
- Comments for complex logic only

### File Naming
- Components: PascalCase (`ChatInterface.tsx`)
- Utilities/libs: camelCase (`textChunker.ts`)
- API routes: kebab-case folders (`/api/upload/route.ts`)
- Types: PascalCase with `.types.ts` suffix or in `types/` folder

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home/landing
│   ├── chat/page.tsx      # Chat interface
│   ├── upload/page.tsx    # Document upload
│   ├── graph/page.tsx     # Graph explorer
│   └── api/               # API routes
│       ├── upload/route.ts
│       ├── chat/route.ts
│       ├── documents/route.ts
│       └── graph/route.ts
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── chat/             # Chat-specific components
│   ├── upload/           # Upload-specific components
│   └── graph/            # Graph visualization components
├── lib/                   # Core business logic
│   ├── neo4j.ts          # Neo4j connection
│   ├── chunker.ts        # Text chunking
│   ├── embeddings.ts     # Embedding generation
│   ├── graph-builder.ts  # Knowledge graph construction
│   ├── retrieval.ts      # Hybrid retrieval logic
│   └── llm.ts           # LLM client (Groq/OpenAI)
├── types/                 # TypeScript type definitions
└── config/               # Configuration constants
```

### Dependencies to Use
- `next` — Framework
- `tailwindcss` — Styling
- `neo4j-driver` — Neo4j connection
- `langchain` — LLM orchestration
- `@langchain/groq` — Groq integration
- `@langchain/openai` — OpenAI integration
- `pdf-parse` — PDF text extraction
- `lucide-react` — Icons
- `react-force-graph` — Graph visualization

### Environment Variables
```
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
GROQ_API_KEY=
OPENAI_API_KEY=
EMBEDDING_MODEL=bge-m3
```

### Error Handling
- Use try/catch in all API routes
- Return consistent error response format: `{ error: string, details?: string }`
- Log errors server-side, show user-friendly messages client-side

### API Response Format
```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: string, details?: string }
```
