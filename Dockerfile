# ---- Base Stage ----
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Install dependencies ----
COPY bun.lock package.json ./
RUN bun install --frozen-lockfile

# ---- Copy the rest of the source code ----
COPY . .

# ---- Accept environment variables at build time ----
# These are provided automatically by Railway if set in "Variables"
ARG DATABASE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GEOAPIFY_API_KEY

# ---- Make them available inside the build ----
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_GEOAPIFY_API_KEY=${NEXT_PUBLIC_GEOAPIFY_API_KEY}

# ---- Generate Prisma client ----
RUN bunx prisma generate

# ---- Build Next.js app ----
RUN bun run build

# ---- Runtime Stage ----
FROM oven/bun:1 AS runner
WORKDIR /app

# Copy built assets and minimal files
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/bun.lock ./

# ---- Environment (for runtime, Railway injects automatically) ----
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# ---- Start Command ----
# If you use Hono custom server (server.ts), change this to:
# CMD ["bun", "run", "server.ts"]
CMD ["bun", "run", "start"]
