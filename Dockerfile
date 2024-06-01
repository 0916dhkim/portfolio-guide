FROM node:20

WORKDIR /app
COPY . /app

RUN npm install -D

WORKDIR /app/server
RUN npm run build

CMD node dist/src/index.mjs
