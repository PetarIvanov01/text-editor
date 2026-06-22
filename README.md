# Learning Text Editor

A small TypeScript workspace for learning editor architecture. The goal is clarity, not production readiness.

## Architecture

The project is split into two packages:

- `packages/editor-core`: platform-independent editor engine.
- `packages/editor-web`: browser UI that renders and controls the core.

The data flow is intentionally direct:

```text
UI input
  -> action / command
  -> editor core state
  -> events
  -> web renderer updates
```

`editor-core` owns the document, cursor, selection, editing operations, events, and undo/redo history. It does not import DOM, browser storage, Electron, Node filesystem APIs, or framework APIs.

`editor-web` listens to browser keyboard events, translates them into `EditorAction` objects, dispatches them to `EditorState`, and rerenders when the core emits a change event. The DOM is only a view; it is not the source of truth.

## Run

Install dependencies:

```bash
npm install
```

Start the browser editor:

```bash
npm run dev
```

Run core tests:

```bash
npm test
```

Build all packages:

```bash
npm run build
```

## Package Scripts

- `npm run dev`: starts the web app through Vite.
- `npm run build`: builds all workspace packages.
- `npm test`: runs editor-core unit tests.

## Next Steps

1. Mouse selection
2. Clipboard support
3. Search/highlighting
4. Syntax tokenization
5. File-system abstraction
6. Electron shell
7. Replacing `string[]` with a gap buffer or piece table
