# For hosts that run containers (Fly.io, Railway, a VPS, ...).
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY public ./public
COPY server ./server
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server/index.js"]
