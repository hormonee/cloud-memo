#!/bin/bash

# audit_nextjs.sh - Next.js Design & Security Auditor

echo "--- 🔍 Auditing Next.js Design & Security ---"

# 1. Check for 'use client' usage and potential misuse
echo "[1] Checking Server/Client Component Separation..."
grep -r "'use client'" app | head -n 10
echo "Tip: Ensure 'use client' is only in components that need interactivity."

# 2. Check for potential secret leaks (NEXT_PUBLIC_ for secrets)
echo -e "\n[2] Checking for Secret Leaks..."
grep -r "NEXT_PUBLIC_.*_KEY" . --exclude-dir=node_modules | grep -v "ANON_KEY"
echo "Tip: Never use NEXT_PUBLIC_ for server-side secrets like SERVICE_ROLE_KEY."

# 3. Check for dangerouslySetInnerHTML
echo -e "\n[3] Checking for dangerouslySetInnerHTML..."
grep -r "dangerouslySetInnerHTML" app 
echo "Tip: Avoid this unless content is sanitized."

# 4. Check for Supabase client usage (Server Actions vs Client Components)
echo -e "\n[4] Checking Supabase Client Usage..."
grep -r "createServerActionClient" app
grep -r "createClientComponentClient" app
echo "Tip: Use the specialized Supabase SSR helpers correctly."

# 5. Check for hardcoded secrets (Basic check)
echo -e "\n[5] Checking for Hardcoded Secrets..."
grep -rE "sk-|_key|password" . --exclude-dir=node_modules --exclude=package-lock.json --exclude-dir=.git | head -n 5

echo -e "\n--- ✅ Audit Complete ---"
