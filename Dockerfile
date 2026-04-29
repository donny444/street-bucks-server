FROM node:20-alpine

# Install PostgreSQL client for running SQL scripts
RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json .

RUN npm install --save

COPY . .

RUN npx prisma generate

EXPOSE 8085

RUN npm run build

# Copy the initialization script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

CMD ["/docker-entrypoint.sh"]