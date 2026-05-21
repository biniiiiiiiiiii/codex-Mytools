# AGENTS.md

## Project
This is a small personal JSON tools website.

## Goals
- pure frontend only
- local-first processing
- minimal dependencies
- fast delivery in 3 rounds
- maintainable structure

## Stack
- React
- TypeScript
- Vite

## Rules
- Do not introduce backend
- Do not add auth, account system, or cloud sync
- Prefer browser-side processing
- Keep components small and reusable
- Put feature logic under src/features
- Put shared JSON utilities under src/shared/utils
- Add tests for parsing, diff, path query, and conversion logic
- Avoid unnecessary refactors
- Preserve stable public component interfaces when possible

## Delivery
- Explain changed files
- Summarize trade-offs
- Provide a manual verification checklist
