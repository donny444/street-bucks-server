FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm install --save

COPY . .

RUN npx prisma generate

EXPOSE 8085

RUN npm run build

CMD ["npm", "run", "start:prod"]