FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY ./ ./

CMD ["node", "/app/app.js"]

# METADATA #

EXPOSE 8080

# From Workflow
