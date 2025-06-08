FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apk add --no-cache netcat-openbsd

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

COPY ./config/e2e.entrypoint.sh /usr/local/bin/e2e.entrypoint.sh
RUN chmod +x /usr/local/bin/e2e.entrypoint.sh

ENTRYPOINT ["e2e.entrypoint.sh"]
CMD ["npm", "run", "test:e2e"]
