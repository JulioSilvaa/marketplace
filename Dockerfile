FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 5000

CMD ["sh", "-c", "yarn prisma migrate deploy && yarn prod"]
