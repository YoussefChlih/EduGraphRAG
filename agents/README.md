# Agents Directory

This folder contains prompts, configurations, and context files used by AI agents working on this project. It serves as a reference for both human developers and AI assistants to maintain consistency across the codebase.

## Structure

```
agents/
├── prompts/                 # System prompts for LLM calls
│   ├── entity-extraction.md # Prompt for concept/relation extraction
│   └── chat-response.md    # Prompt for generating cited answers
├── configs/                 # Agent behavior and code conventions
│   └── agent-guidelines.md # Coding standards, project structure
└── context/                 # Background knowledge for agents
    ├── tech-stack.md        # Technology reference table
    └── decisions-log.md     # Architecture Decision Records
```

## Purpose

These files provide AI agents with:

1. Project architecture and coding conventions
2. System prompts used in the RAG pipeline
3. Technology choices and their rationale
4. Project-specific patterns and constraints

## Usage

When working on this project, agents should:

- Read `configs/agent-guidelines.md` for code style and structure
- Reference `context/tech-stack.md` for dependency and version info
- Use prompts from `prompts/` when implementing LLM interactions
- Consult `context/decisions-log.md` before proposing architectural changes
