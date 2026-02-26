FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV MONGODB_URI=mongodb://mongodb:27017/logisticshub_auth
ENV JWT_SECRET=replace_with_strong_secret
ENV JWT_EXPIRES_IN=1h
ENV BCRYPT_SALT_ROUNDS=12

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
