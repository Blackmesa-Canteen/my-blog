---
title: Docker Compose for Python Django + postgres
slug: dockercomposeforpythondjangopostgres
date: '2023-07-01T10:30:36.003Z'
categories:
- Notes
- Utilities
tags:
- Python
- Docker
- Development
original_permalink: /archives/dockercomposeforpythondjangopostgres
---

# Intro
Deploy Python Django + postgres backend with Docker Compose in the production environment.
# Files
## Dockerfile.prod
```dockerfile
###########
# BUILDER #
###########

# pull official base image
FROM python:3.9.6-alpine as builder

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install psycopg2 dependencies
RUN apk update \
    && apk add postgresql-dev gcc python3-dev musl-dev

# lint
RUN pip install --upgrade pip
RUN pip install flake8==3.9.2
COPY . .
RUN flake8 --ignore=E501,F401,E122,E722,F841,E203,W292 .

# install dependencies
COPY ./requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt


#########
# FINAL #
#########

# pull official base image
FROM python:3.9.6-alpine

# create directory for the app user
RUN mkdir -p /home/app

# create the app user
RUN addgroup -S app && adduser -S app -G app

# create the appropriate directories
ENV HOME=/home/app
ENV APP_HOME=/home/app/web
RUN mkdir $APP_HOME
RUN mkdir $APP_HOME/staticfiles
WORKDIR $APP_HOME

# install dependencies
RUN apk update && apk add libpq
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# copy entrypoint.prod.sh
COPY ./entrypoint.prod.sh .
RUN sed -i 's/\r$//g'  $APP_HOME/entrypoint.prod.sh
RUN chmod +x  $APP_HOME/entrypoint.prod.sh

# copy project
COPY . $APP_HOME

# chown all the files to the app user
RUN chown -R app:app $APP_HOME

# change to the app user
USER app

# run entrypoint.prod.sh
ENTRYPOINT ["/home/app/web/entrypoint.prod.sh"]
```

## entrypoint.prod.sh
```shell
#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

exec "$@"
```

## docker-compose.prod.yml
```yml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.prod
    command: gunicorn sw_project.wsgi:application --bind 0.0.0.0:8000 --timeout=90
    restart: always
    volumes:
      - static_volume:/home/app/web/staticfiles
    expose:
      - 8000
    ports:
      - "8000:8000"
    env_file:
      - ./.env.prod
    depends_on:
      - db
  db:
    image: postgres:13.0-alpine
    restart: always
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    env_file:
      - ./.env.prod.db

volumes:
  postgres_data:
  static_volume:
```

## Env files
### .env.prod
```TEXT
PYTHONUNBUFFERED=1
DJANGO_SETTINGS_MODULE=sw_project.settings

SECRET_KEY=<secret>
DEBUG=0

DJANGO_ALLOWED_HOSTS=localhost 127.0.0.1
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000 http://127.0.0.1:3000 

DB_ENGINE=django.db.backends.postgresql
DB_NAME=<secret>
DB_USER=<secret>
DB_PASSWORD=<secret>
DB_HOST=db
DB_PORT=5432
```
### .env.prod.db
```text
POSTGRES_USER=<secret>
POSTGRES_PASSWORD=<secret>
POSTGRES_DB=<secret>
```

# Usage
Use Docker compose to run the project in production environment.
1. Make sure you have docker and docker-compose on the runtime environment;
2. Check configurations: `.env.prod` `.env.prod.db`, `docker-compose.prod.yml`, `Dockerfile.prod`;
3. Initially start the backend server:
```bash
# add runtime permission to entrypoint.prod.sh
chmod +x ./entrypoint.prod.sh
# remove previous containers and volumes
docker compose -f docker-compose.prod.yml down -v
# build and start the backend server
docker compose -f docker-compose.prod.yml up -d --build
# migrate database
docker compose -f docker-compose.prod.yml exec web python manage.py migrate --noinput
```
4. If you need to restart the backend service without remove any database records in host machine:
```bash
# shutdown the backend server without remove db volume on host machine
docker compose -f docker-compose.prod.yml down
# start the backend server
docker compose -f docker-compose.prod.yml up -d
```
