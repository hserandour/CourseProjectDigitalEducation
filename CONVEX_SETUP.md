# Convex Setup & Launch Guide

This guide walks through creating a Convex project, connecting it to your app, and running everything from the VS Code integrated terminal.

## Prerequisites

- Node.js installed (v18+ recommended)
- A project folder open in VS Code
- npm (or yarn/pnpm — examples below use npm)

## 1. Open the VS Code Terminal

- `Ctrl + \`` (Windows/Linux) or `Cmd + \`` (Mac), or
- Menu: **Terminal → New Terminal**

Make sure the terminal's working directory is your project root.

## 2. Option A — Start a Brand New Project with Convex

If you don't have a frontend yet, scaffold one with Convex built in:

```bash
npm create convex@latest my-app -- -t react-vite-shadcn
cd my-app
npm install
```

Available starter templates include:

| Template | Stack |
|---|---|
| `react-vite-shadcn` | React + Vite + Tailwind + shadcn/ui |
| `nextjs-shadcn` | Next.js App Router + Tailwind + shadcn/ui |
| `react-vite-clerk-shadcn` | React + Vite + Clerk auth + shadcn/ui |
| `nextjs-clerk` | Next.js + Clerk auth |

To scaffold into the **current** (empty) folder instead of a new subfolder:

```bash
npm create convex@latest . -- -t react-vite-shadcn
npm install
```

## 2. Option B — Add Convex to an Existing App

If you already have a frontend project (React, Next.js, Vue, Svelte, etc.):

```bash
npm install convex
```

Then wire up the client. Create the Convex client **once, at module scope** — not inside a component:

```js
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

// Wrap your app root:
// <ConvexProvider client={convex}>
//   <App />
// </ConvexProvider>
```

(For Next.js, use the Next-specific provider pattern and `NEXT_PUBLIC_CONVEX_URL`.)

## 3. Create and Connect Your Convex Project

From the VS Code terminal, run:

```bash
npx convex dev
```

This is a **long-running watcher process** — it stays open and syncs your backend code every time you save. On first run it will:

1. Prompt you to **log in** (browser-based OAuth) or develop **anonymously**
2. Create a new Convex project and dev deployment
3. Write the deployment URL into `.env.local`
4. Create the `convex/` directory with generated types
5. Keep watching for file changes and syncing continuously

Leave this terminal tab running while you develop.

> **Tip:** Deployment URLs for all environments can also be found in the **Settings** section of your project on the [Convex dashboard](https://dashboard.convex.dev).

## 4. Run Frontend + Backend Together

Since `npx convex dev` occupies one terminal, you have two options:

**Option 1 — Two terminals in VS Code** (simplest):
- Terminal 1: `npx convex dev`
- Terminal 2 (split terminal, `Ctrl/Cmd + Shift + 5`): `npm run dev`

**Option 2 — One command for both** (recommended for daily use):
Add a script to `package.json` using a tool like `concurrently`:

```json
"scripts": {
  "dev": "concurrently \"npx convex dev\" \"vite\""
}
```

Then just run:

```bash
npm run dev
```

## 5. Launch the App

Once both processes are running:

- The frontend dev server will print a local URL (e.g. `http://localhost:5173`) — open it in your browser, or `Cmd/Ctrl + Click` it directly in the VS Code terminal.
- The `convex dev` terminal will show sync logs confirming your functions and schema deployed successfully.

## Quick Reference

| Task | Command |
|---|---|
| Scaffold new project with Convex | `npm create convex@latest my-app -- -t react-vite-shadcn` |
| Add Convex to existing app | `npm install convex` |
| Start Convex backend + watcher | `npx convex dev` |
| One-shot validate/typecheck (no watch) | `npx convex dev --once` |
| Start frontend dev server | `npm run dev` |
| Open Convex dashboard | [dashboard.convex.dev](https://dashboard.convex.dev) |

## Troubleshooting

- **"Command not found: npx convex"** → run `npm install convex` first, or ensure `node_modules/.bin` is on your PATH.
- **Env var not found in frontend** → confirm `.env.local` was created and restart your dev server after `npx convex dev` first runs.
- **Login/browser auth doesn't open automatically** → copy the URL printed in the terminal into your browser manually.
