FROM node:18.13.0-alpine

RUN apk update && addgroup app && adduser -S -G app app

USER app
     
WORKDIR /app

RUN mkdir data

COPY package.json .

RUN npm i

COPY . .

EXPOSE 8080

ENTRYPOINT ["node", "app.js"]