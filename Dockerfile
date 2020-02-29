FROM node:13.8.0-alpine3.11

RUN apk update && apk add nginx zsh

#RUN npm install pm2 -g

RUN mkdir -p /home/node/app/devcamperapis && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 5000

CMD [ "node", "server.js" ]