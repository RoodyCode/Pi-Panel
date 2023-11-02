FROM node:latest

WORKDIR /app

COPY ["server/package.json", "server/package-lock.json", "./"]

RUN npm install

COPY . .

CMD [ "node", "server/server.js" ]
