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

## Round 2 scope
Round 2 only includes:
- JSON Diff
- JSON tree viewer
- JSONPath query

## Constraints for Round 2
- Keep the project pure frontend
- Do not introduce backend, auth, or cloud sync
- Preserve stable shared component interfaces from round 1 when possible
- Reuse editor, toolbar, result panel, and storage utilities
- Add tests for diff logic, path query logic, and tree data transformation
- Avoid adding heavyweight dependencies unless clearly justified

## Done when
- /diff, /viewer, /path-query pages work end-to-end
- invalid JSON is handled gracefully
- key round 1 flows still work
- tests for critical logic pass