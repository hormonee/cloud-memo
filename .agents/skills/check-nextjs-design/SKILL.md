---
name: check-nextjs-design
description: Skill for auditing Next.js 15 App Router design, server/client component separation, and security.
---

# Next.js Design & Security Auditor Skill

This skill provides guidelines and tools to ensure that the project follows Next.js 15 best practices and remains secure.

## Core Audit Areas

### 1. Server vs. Client Components
- **Server Components (Default)**: Used for data fetching, large dependencies, and non-interactive UI.
- **Client Components (`'use client'`)**: Used ONLY for interactivity (`onClick`, `useEffect`, `useState`, etc.).
- **Boundary Check**: Ensure that heavy data-fetching logic is kept in Server Components to minimize bundle size.

### 2. Security Patterns
- **Secrets & Env Vars**: Never use `NEXT_PUBLIC_` for server-side secrets (e.g., `SUPABASE_SERVICE_ROLE_KEY`).
- **Data Access**: Ensure Server Actions and API routes have proper authorization checks.
- **Safe Rendering**: Avoid `dangerouslySetInnerHTML` unless absolutely necessary and sanitized.
- **Supabase Security**: Use the appropriate client (Client Components: `createClientComponentClient`, Server Actions: `createServerActionClient`, etc.).

## How to Use

### 1. Run Automated Audit
Execute the audit script to scan the codebase for common issues:
```bash
./.agents/skills/check-nextjs-design/scripts/audit_nextjs.sh
```

### 2. Manual Review Checklist
- [ ] Is `'use client'` at the very top of files that need interactivity?
- [ ] Are sensitive API calls (e.g., billing, secret generation) restricted to Server-side?
- [ ] Are there any hardcoded secrets in the code?
- [ ] Does the `app/layout.tsx` use appropriate metadata?

## Interpreting Results

The audit script will flag potential issues for manual review. A "WARNING" indicates a design flaw or a minor security concern, while "CRITICAL" indicates a severe security risk.
