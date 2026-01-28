FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package.json
COPY apps/api/package.json apps/api/package.json

RUN npm install --omit=dev --workspace apps/api

COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/apps/web/dist /app/apps/web/dist

ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/api/dist/index.js"]