# Install dependencies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
RUN apk add --no-cache git
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY .git .git

ENV NEXT_TELEMETRY_DISABLED 1
ENV DOCKER_BUILD 1

RUN npm i sharp -y

RUN npm run build


# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm i sharp -y

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/ ./
RUN chown nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "run", "start"]