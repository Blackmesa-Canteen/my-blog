---
title: Heroku部署Docker容器化的Java web maven应用
slug: heroku-bu-shu-docker-rong-qi-hua-de-javawebmaven-ying-yong
date: '2022-08-19T01:09:09.290Z'
categories:
- Notes
- Learning
- Utilities
tags:
- Docker
- Development
- Notes
- Java
original_permalink: /archives/heroku-bu-shu-docker-rong-qi-hua-de-javawebmaven-ying-yong
---

# Dockerfile示例
首先, 确保Java web app 能够通过运行参数指定运行时端口.
以下是Dockerfile示例. 注意`$port`是heroku传入的需要容器暴露给它的端口号.
```dockerfile
FROM maven:3.8.6-jdk-11-slim AS builder

ADD ./pom.xml pom.xml
ADD ./src src/

# packge clean first, then package
RUN mvn clean package

# mini java 11 runtime
FROM adoptopenjdk/openjdk11:jre-11.0.9_11.1-alpine

# copy jar to docker to run

COPY --from=builder target/app.jar app.jar

#FROM adoptopenjdk/openjdk11:jre-11.0.9_11.1-alpine
#ADD ./out/artifacts/app_jar/alphecca-hotel-booking.jar app.jar

# default export 8088
ENV PORT=$port
EXPOSE $PORT

# docker build -t hotel-booking-app:v1 .
# docker run --name hotel-booking-app -p 0.0.0.0:8088:8088 hotel-booking-app:v1
CMD java -jar app.jar -port $PORT
```

# 安装
1. 注册Heroku账户;
2. 在Heroku Create app, 记下来app名字, 设 `APP_NAME`;
3. 安装Heroku-Cli在电脑上.

# 部署
我写了个sh脚本供参考, 和Dockerfile在同一个目录下运行. 注意把`APP_NAME`替换成你在Heroku上创建的app的名字.
```bash
#!/bin/sh

# Install Heroku CI and docker first!
# then, please login the heroku
heroku login

# then, login the heroku container
heroku container:login

# then build the docker thing
docker build -t my-app .

# tag the image to heroku repo
docker tag my-app:latest registry.heroku.com/APP_NAME/web

# push the repo to heroku
docker push registry.heroku.com/APP_NAME/web

# release the container
heroku container:release web --app APP_NAME

# then it works

```
