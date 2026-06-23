#!/bin/bash
set -e

echo "Start Spring Boot backend"

APP_DIR=/home/ec2-user/app/backend
LOG_FILE=$APP_DIR/app.log

cd "$APP_DIR"

pkill -f '.jar' || true

JAR_FILE=$(ls *.jar | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "No jar file found in $APP_DIR"
  exit 1
fi

nohup java -jar "$JAR_FILE" > "$LOG_FILE" 2>&1 &
