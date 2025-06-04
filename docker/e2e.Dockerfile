FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN apk add --no-cache netcat-openbsd

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

COPY ./config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["npm", "run", "test:e2e"]
