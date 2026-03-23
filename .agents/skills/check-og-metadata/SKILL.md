---
name: check-og-metadata
description: Skill for auditing and recommending Open Graph (OG) meta tags for individual pages.
---

# OG Metadata Auditor Skill

This skill provides a standardized way to audit the Open Graph (OG) and SEO metadata of the project and identify pages that need custom metadata.

## Core Audit Areas

### 1. Global Metadata Check
- Review `app/layout.tsx` for baseline `title`, `description`, `openGraph`, and `twitter` tags.
- Ensure placeholder values (like URLs) are identified for production updates.

### 2. Page-Specific Metadata
- Identify major landing/entry pages (e.g., `/auth`, `/dashboard`, `/notes`).
- Recommended Practice: Each major page should export its own `Metadata` object to overwrite global defaults with more specific context.

### 3. Visual Assets (OG Images)
- Check if `og-image.png` is assigned.
- Identify if certain pages (e.g., a shared note) should have a dynamic/specific OG image.

## How to Use

### 1. Run OG Audit Script
Check which pages have custom metadata:
```bash
./.agents/skills/check-og-metadata/scripts/audit_og.sh
```

### 2. Identify Metadata Candidates
Look for `page.tsx` files that currently lack a `metadata` export.

## Recommendation Template

For each identified page, the skill should provide a recommendation following this pattern:

```typescript
export const metadata: Metadata = {
  title: "Cloud Memo - [Page Title]",
  description: "[Specific Page Description]",
  openGraph: {
    title: "Cloud Memo - [Page Title]",
    description: "[Specific Page Description]",
    // Optional: Dynamic image or specific path
  }
};
```

## Interpreting Results

- **PASS**: Page has its own metadata.
- **INHERITED**: Page uses root layout metadata (consider customizing if it's a major entry point).
