FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# build TypeScript
RUN npm run build

EXPOSE 3000

CMD ["node","dist/server.js"]

