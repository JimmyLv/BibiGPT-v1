# This is a dockerfile for a development environment, 
# so you don't have to worry about missing environment variables during the build.

FROM node:alpine

WORKDIR /app
COPY . .

ENV NODE_ENV development
ENV PORT 3000

RUN rm -rf .env && npm ci

EXPOSE 3000
CMD ["node_modules/.bin/next", "dev"]