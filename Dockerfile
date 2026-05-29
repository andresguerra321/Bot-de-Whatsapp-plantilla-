FROM node:20-alpine

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
RUN npm install --production

COPY . .

RUN mkdir -p /data/sesion && chown -R appuser:appgroup /app /data

USER appuser

CMD ["node", "src/bot.js"]