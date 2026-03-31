# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup                                        # install, generate Prisma client, run migrations
npm run dev                                          # development server (Turbopack)
npm run build                                        # production build
npm run test                                         # run all tests
npx vitest run src/path/to/__tests__/file.test.tsx   # run a single test file
npm run db:reset                                     # reset database
npx prisma generate && npx prisma migrate dev        # regenerate Prisma client after schema changes
```

## Code Style

Use comments sparingly — only for complex or non-obvious logic.

## Environment

Requires `ANTHROPIC_API_KEY` in `.env` for AI generation; without it the app falls back to `MockLanguageModel` (static demo responses).

## Architecture

**UIGen** is a Next.js 15 app that generates React components via Claude AI and previews them live in an iframe. All generated code lives in a virtual file system — nothing is written to disk.

### Request Flow

1. User sends a message → `POST /api/chat` with messages + serialized virtual FS state
2. API route reconstructs `VirtualFileSystem` from JSON, calls Claude (Haiku 4.5) with streaming
3. Claude streams text and calls tools (`str_replace_editor`, `file_manager`) to create/modify files
4. Tool results are applied to the in-memory FS; updated FS is returned in the response
5. Client updates `FileSystemContext` → triggers `PreviewFrame` to re-transform and re-render

### Key Subsystems

**Virtual File System** (`src/lib/file-system.ts`)
`VirtualFileSystem` class — in-memory file store. Serialized to JSON and sent with every chat request so the server can reconstruct state. The server mutates a copy, then returns the new state.

**AI Integration** (`src/lib/provider.ts`, `src/app/api/chat/route.ts`)
- `getLanguageModel()` returns Anthropic Claude Haiku 4.5 or `MockLanguageModel`
- Two tools: `str_replace_editor` (view/create/edit files) and `file_manager` (rename/delete)
- System prompt (`src/lib/prompts/generation.tsx`) constrains Claude to produce Tailwind-styled React components with `App.jsx` as the root entry point and `@/` import aliases

**JSX Transform** (`src/lib/transform/`)
Babel-standalone transforms JSX → ESM blob URLs at runtime in the browser. An import map resolves `@/` aliases and maps bare package imports to `esm.sh`. Placeholder modules handle missing imports gracefully.

**State Management**
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) — virtual FS state + operations
- `ChatContext` (`src/lib/contexts/chat-context.tsx`) — wraps Vercel AI SDK `useChat`; no external state library

**Auth** (`src/lib/auth.ts`, `src/actions/index.ts`)
JWT sessions via `jose`, 7-day cookies. Anonymous work is tracked in `sessionStorage` (`src/lib/anon-work-tracker.ts`) and converted to a saved project on sign-up.

**Database** (`prisma/schema.prisma`)
Source of truth for all data models — read it whenever you need to understand the structure of data stored in the database. SQLite via Prisma. Two models: `User` and `Project`. Project stores messages and virtual FS as JSON blobs in `messages` and `data` columns.

### Route Map

| Path | Purpose |
|------|---------|
| `/` | Home — redirects authenticated users to their project |
| `/[projectId]` | Project workspace (chat + preview/editor) |
| `/api/chat` | Streaming AI chat endpoint (120s timeout) |
| `/api/projects` | Project CRUD (protected) |
| `/api/filesystem` | FS persistence (protected) |

### UI Layout

`MainContent` (`src/app/main-content.tsx`) renders resizable panels:
- **Left**: `ChatInterface` → `MessageList` + `MessageInput`
- **Right**: tabbed between `PreviewFrame` (iframe) and `CodeEditor` (Monaco) + `FileTree`
