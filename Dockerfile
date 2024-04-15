FROM node:20.12-alpine3.19

# Create app directory
WORKDIR /usr/src/app
ENV CHROMIUM_BIN=/usr/bin/chromium-browser \
    DCOLEMAN_URL=http://django-coleman:8000 \
    DCOLEMAN_TASKS_VIEWER_URL=http://django-coleman-mtasks-viewer:8888 \
    CI=true

RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.19/main" >> /etc/apk/repositories \
    && apk upgrade -U -a \
    && apk add --no-cache chromium ffmpeg

# Install dependencies
COPY package.json package-lock.json playwright.config.js ./
RUN npm install \
    && mkdir -p test-results

COPY ./tests ./tests

ARG BUILD
LABEL build=${BUILD}
RUN echo "Build: $BUILD" > image_build \
    && echo "UTC: $(date --utc +%FT%R)" >> image_build

CMD ["npm", "run", "test:ci"]
