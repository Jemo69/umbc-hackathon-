📦 Package Manager

Always use pnpm (not npm or yarn) for any install commands.
Example:

pnpm add convex react next

📂 Project Structure

Use Next.js App Router (app/ directory).

Default to Server Components.

Only use Client Components when interactivity is required ('use client' at the top).

🎨 Code Style & Conventions

Use TypeScript with strong typing everywhere.

Use async/await (never .then chaining).

Include error handling (try/catch or explicit error returns).

Keep naming consistent and meaningful.

Format with clean indentation (2 spaces).

Include inline comments only where needed to clarify logic.

🏗️ Convex Integration

Always import Convex helpers correctly:

import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";


Use the generated types from convex/_generated/ instead of any.

Enforce auth & user isolation in queries/mutations.

Avoid leaving TODOs; handle cases explicitly.

🖼️ Frontend (Next.js + TailwindCSS)

Use TailwindCSS with semantic HTML.

Use functional & composable components, not one big dump.

Prefer utility-first classes (minimal custom CSS).

Keep UI clean and production-ready.

📄 File Guidelines

Keep code self-contained in one file unless explicitly asked to split.

If splitting is needed, keep imports neat and relative.

⚡ Performance & Safety

Use reactive queries from Convex when possible.

Implement basic validation with Convex’s v helpers.

Write code as if for production, not a toy demo
