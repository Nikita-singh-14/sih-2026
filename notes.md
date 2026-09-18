cd backend
docker compose up -d
Copy-Item .env.example .env
npx prisma migrate dev --name add-auth-users
npm run start:dev99k