#!/bin/bash

# audit_og.sh - OG Metadata Auditor

echo "--- 🔍 Auditing OG Metadata & SEO ---"

# 1. Global Metadata Check
echo "[1] Checking Global Metadata (layout.tsx)..."
grep -A 20 "export const metadata" app/layout.tsx

# 2. Check for Page-Specific Metadata Exports
echo -e "\n[2] Checking for Custom Metadata in Pages..."
find app -name "page.tsx" -exec grep -l "export const metadata" {} + 2>/dev/null | xargs ls -l
echo "Tip: Pages listed above have custom metadata. Others inherit root layout."

# 3. Identify High-Priority Candidate Pages (Without Metadata)
echo -e "\n[3] High-Priority Candidate Pages (No Custom Metadata):"
for page in $(find app -name "page.tsx" -maxdepth 3); do
    if ! grep -q "export const metadata" "$page"; then
        echo " - $page (INHERITED)"
    fi
done

# 4. Check for og:image existence
echo -e "\n[4] Checking for OG Image Asset..."
ls -l public/og-image.png 2>/dev/null || echo "❌ CRITICAL: Missing public/og-image.png"

echo -e "\n--- ✅ Audit Complete ---"
