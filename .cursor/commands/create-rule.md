# Create Rule

Use the `create-rule` skill to help me author a new Cursor rule.

## What you do

1. If chat context already tells you the rule's scope and target files, infer them. Otherwise use `AskQuestion` for only the missing pieces:
   - scope — **always apply** or **file-scoped**?
   - if file-scoped, which glob(s)? (e.g. `**/*.ts`, `src/app/api/**/*.ts`, `prisma/**/*.prisma`)
2. Write `.cursor/rules/<name>.mdc` with YAML frontmatter:
   - `description`: one line — what the rule enforces
   - `globs`: only for file-scoped rules
   - `alwaysApply: true` only when it truly applies to every session
3. Keep the body **under 50 lines**, one concern per rule. If it grows, split into multiple `.mdc` files.
4. Include at least one concrete `✅ GOOD` / `❌ BAD` example so the rule is actionable, not abstract.
5. Match tone and Chinese/English mix of existing rules in `.cursor/rules/` (see `easecity-overview.mdc`, `api-route-handlers.mdc`, `database-prisma.mdc`).

## easecity conventions to respect

- Next.js 14 App Router, `src/app`, route groups `(public)` / `(auth)` / `admin`, path alias `@/` → `src/`.
- Prisma via the singleton in `src/lib/db.ts` — never `new PrismaClient()` per request.
- Auth via NextAuth (`src/lib/auth.ts`), JWT strategy, `session.user.id` / `role`.
- i18n via `LanguageProvider` + `useLanguage()`; new strings must land in both `en` and `zh`.
