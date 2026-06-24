#!/bin/bash
set -e

echo "Start Spring Boot backend"

APP_DIR=/home/ec2-user/app/backend
LOG_FILE=$APP_DIR/app.log

mkdir -p "$APP_DIR"
cd "$APP_DIR"

pkill -f 'java -jar.*\.jar' || true

JAR_FILE=$(find . -maxdepth 1 -type f -name "*.jar" ! -name "*-plain.jar" | sort | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "No jar file found in $APP_DIR"
  exit 1
fi

echo "Using jar file: $JAR_FILE"

nohup java -jar "$JAR_FILE" \
  --spring.datasource.url=jdbc:h2:mem:testdb \
  > "$LOG_FILE" 2>&1 &

sleep 5

if ! pgrep -f "java -jar.*$JAR_FILE" >/dev/null; then
  echo "Spring Boot backend failed to start. Last log lines:"
  tail -n 100 "$LOG_FILE" || true
  exit 1
fi

echo "Spring Boot backend started"
