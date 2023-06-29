# Hi, here is a Docker build file for your convenience in building a private Docker image.
# Please make sure to configure the .env file in this project's root directory before proceeding.
# It is important to note that this Docker image will include your .env file, so do not publicly share your Docker image.

# Please follow the steps below:
# 1. Install Docker
# 2. Configure .env file
# 3. Build Docker image

# > Step 1 build NextJs
FROM node:alpine AS builder
WORKDIR /app
COPY . .

# removing sentry. If you want to use sentry, please set IS_USED_SENTRY=1
ARG IS_USED_SENTRY=0
RUN if [[ $IS_USED_SENTRY -eq 0 ]]; then \
        sed -i 's/const { withSentryConfig }/\/\/ const { withSentryConfig }/' ./next.config.js &&\
        sed -i 's/module.exports = withSentryConfig/\/\/ module.exports = withSentryConfig/' ./next.config.js \
    ; fi
# building Nextjs
RUN npm ci && npm run build


# > Step 2 Build docker image
FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

RUN addgroup -g 1001 -S nodejs &&\
    adduser -S nextjs -u 1001

COPY --from=builder /app/.env ./.env
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/README.md ./README.md
COPY --from=builder /app/LICENSE.txt ./LICENSE.txt

USER nextjs
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]