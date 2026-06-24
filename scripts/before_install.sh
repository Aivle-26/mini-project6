#!/bin/bash
set -e

APP_ROOT=/var/www/my-angular-project
BACKEND_DIR=/home/ec2-user/app/backend

echo "Prepare deployment directories"

pkill -f 'java -jar.*bookapp.*\.jar' || true
pkill -f 'java -jar.*\.jar' || true

mkdir -p "$APP_ROOT"
mkdir -p "$BACKEND_DIR"

find "$BACKEND_DIR" -maxdepth 1 -type f -name "*.jar" -delete

chown -R ec2-user:ec2-user /home/ec2-user/app || true
chmod -R 755 "$APP_ROOT" "$BACKEND_DIR"
