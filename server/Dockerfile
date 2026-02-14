FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server/ ./server/
COPY .env.example .env.example

EXPOSE 5000

CMD ["node", "server/index.js"]
