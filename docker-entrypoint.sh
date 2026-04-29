#!/bin/sh

echo "Starting server initialization..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h database -p 5432 -U postgres; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations to create database schema
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo "Database schema created successfully!"
  
  # Run data seeding
  echo "Seeding database with initial data..."
  PGPASSWORD=$POSTGRES_PASSWORD psql -h database -U postgres -d street_bucks -f /app/sql-scripts/compound_queries.sql
  
  if [ $? -eq 0 ]; then
    echo "Database seeding completed successfully!"
  else
    echo "Warning: Database seeding failed, but continuing..."
  fi
else
  echo "Warning: Prisma migration failed, but continuing..."
fi

# Start the application
echo "Starting the server application..."
exec npm run start:prod