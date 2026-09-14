---
title: Deploy React.js & Nginx project on Heroku platform with Docker
slug: docker-bu-shu-ji-yu-heroku-ping-tai-de-react-xiang-mu
date: '2022-09-19T13:12:20.529Z'
categories:
- Notes
- Utilities
tags:
- Front-End
- Docker
- Development
- React.js
- Nginx
original_permalink: /archives/docker-bu-shu-ji-yu-heroku-ping-tai-de-react-xiang-mu
---

# 0. Abstract

We deployed a React project to the Heroku platform with Docker. 

The React app is running on Nginx.

# 1. Dockerfile
```shell
FROM node:14 as build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY package*.json ./
RUN npm install

COPY src ./src
COPY public ./public
COPY config.js ./config.js

#ENV PORT=$port
#EXPOSE $PORT
#RUN PORT=5000 npm start

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
ENV PORT=$port
EXPOSE $PORT

COPY nginx.conf /etc/nginx/conf.d/default.conf
# CMD ["nginx", "-g", "daemon off;"]
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'

```

# 2. Nginx config file
This config file should put in the project dir.
This config file solved path 404 problem caused by "BrowserRoute" element of the React.
```text
server {
  listen 0.0.0.0:$PORT;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}

```


# 3. shell script file
I crafted this file to speed up deployment:
```shell
#!/bin/sh
# author: 996 worker

# Install Heroku CI and docker first!
# then, please login the heroku
heroku login

# then, login the heroku container
heroku container:login

# then build the docker thing
docker build -t frontend-app .

# tag the image to heroku repo
docker tag frontend-app:latest registry.heroku.com/alphecca-frontend/web

# push the repo to heroku
docker push registry.heroku.com/alphecca-frontend/web

# release the container
heroku container:release web --app alphecca-frontend

# clean-up
docker rmi frontend-app
docker rmi registry.heroku.com/alphecca-frontend/web
```
