#!/bin/bash

cd /home/ubuntu/url-shortener

git pull

docker compose down

docker compose up -d --build