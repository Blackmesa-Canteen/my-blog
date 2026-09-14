---
title: Solving 'Unable to open X display in docker' while executing puppeteer in headful
  mode in Docker
slug: solvingunabletoopenxdisplayindockerwhileexecutingpuppeteerinheadfulmodeindocker
date: '2023-02-22T05:47:59.138Z'
categories:
- Random
- Utilities
tags:
- Docker
- Development
original_permalink: /archives/solvingunabletoopenxdisplayindockerwhileexecutingpuppeteerinheadfulmodeindocker
---

# Problem
While running puppeteer with Non-headless mode in a docker container, a bug occurs: `Unable to open X display in docker`.

# Solution
Docker container's base image does have GUI system. Install X server related as GUI. Please see Dockerfile below, it works fine:
```Dockerfile
FROM node:16-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# If running Docker >= 1.13.0 use docker run's --init arg to reap zombie processes, otherwise
# uncomment the following lines to have `dumb-init` as PID 1
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_x86_64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init
ENTRYPOINT ["dumb-init", "--"]

# install dependencies
RUN apt-get update && apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

# essential files
ADD ./src src/
ADD ./.env .env
ADD ./.eslintrc.json .eslintrc.json
ADD ./package.json package.json
ADD ./package-lock.json package-lock.json
ADD ./sonar-project.properties sonar-project.properties
ADD ./website-verifier.js website-verifier.js

# init image
RUN npm install
RUN node node_modules/puppeteer/install.js
# RUN ln -s /usr/bin/chromium /usr/bin/chromium-browser

# hide chorme display in docker
# Notice: Should NOT hide display to prevent anti-bot detection
# ENV SCRAPER_HIDE_CHROME_WINDOW 1

# install Xvfb for non-headless chrome
RUN apt-get update && apt-get install -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps xvfb

# run command while running the instance
CMD xvfb-run --server-args="-screen 0 1024x768x24" npm run start_scraper


```
