FROM node:20-alpine as builder

WORKDIR /app

RUN chown node:node .

USER node

COPY package.json yarn.lock ./

RUN yarn install

COPY tsconfig.*.json ./

COPY src ./src

RUN yarn build

EXPOSE 3001

ENTRYPOINT [ "node", "./dist/server.js" ]

