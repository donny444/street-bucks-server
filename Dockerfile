FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install --save

COPY . .

EXPOSE 8085

CMD ["npm", "start"]