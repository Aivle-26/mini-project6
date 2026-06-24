#!/bin/bash
set -e

APP_DIR=/home/ec2-user/app/backend
LOG_FILE=/home/ec2-user/app.log

echo "Start Spring Boot backend"

cd "$APP_DIR"

pkill -f 'bookapp.*\.jar' || true
pkill -f 'java -jar.*\.jar' || true

JAR_FILE=$(ls bookapp-*.jar 2>/dev/null | grep -v plain | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "No executable jar found"
  ls -al "$APP_DIR"
  exit 1
fi

echo "Using jar file: $JAR_FILE"

nohup java -jar "$JAR_FILE" \
  --server.servlet.context-path=/api \
  --spring.datasource.url=jdbc:h2:mem:testdb \
  > "$LOG_FILE" 2>&1 &

sleep 10

pgrep -f "$JAR_FILE" || {
  echo "Backend failed to start"
  tail -n 100 "$LOG_FILE" || true
  exit 1
}

echo "Backend started"
