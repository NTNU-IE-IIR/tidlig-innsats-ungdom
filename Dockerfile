FROM node:lts-alpine AS builder

RUN npm install -g pnpm

COPY ./package.json ./pnpm-lock.yaml /app/
WORKDIR /app

RUN pnpm install

ENV NEXT_TELEMETRY_DISABLED 1

COPY . /app

RUN SKIP_ENV_VALIDATION=1 pnpm build

FROM node:lts-alpine AS runner

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/ ./.next/

USER nextjs
EXPOSE 3000
ENV PORT 3000

LABEL org.opencontainers.image.source="https://github.com/NTNU-IE-IIR/tidlig-innsats-ungdom"
LABEL org.opencontainers.image.description="RFFTIU app container"

CMD ["node", "server.js"]