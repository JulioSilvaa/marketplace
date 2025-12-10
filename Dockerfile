FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN DATABASE_URL="postgresql://user:password@localhost:5432/mydb" yarn build

EXPOSE 5000

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn prod"]