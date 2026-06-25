#!/bin/bash
set -e

APP_DIR=/home/ec2-user/app/backend
LOG_FILE=/home/ec2-user/app.log

echo "Start Spring Boot backend"

cd "$APP_DIR"

for ENV_FILE in /home/ec2-user/app/.env "$APP_DIR/.env"; do
  if [ -f "$ENV_FILE" ]; then
    echo "Loading environment from $ENV_FILE"
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
  fi
done

DB_ENGINE="${DB_ENGINE:-h2}"
DB_ENGINE_LOWER=$(echo "$DB_ENGINE" | tr '[:upper:]' '[:lower:]')

if [ "$DB_ENGINE_LOWER" = "mysql" ]; then
  : "${DB_HOST:?DB_HOST is required when DB_ENGINE=mysql}"
  : "${DB_NAME:?DB_NAME is required when DB_ENGINE=mysql}"
  : "${DB_USERNAME:?DB_USERNAME is required when DB_ENGINE=mysql}"
  : "${DB_PASSWORD:?DB_PASSWORD is required when DB_ENGINE=mysql}"

  export DB_PORT="${DB_PORT:-3306}"
  export DB_URL="${DB_URL:-jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8}"
  export DB_DRIVER="${DB_DRIVER:-com.mysql.cj.jdbc.Driver}"
  export DB_DIALECT="${DB_DIALECT:-org.hibernate.dialect.MySQLDialect}"
  export H2_CONSOLE_ENABLED="${H2_CONSOLE_ENABLED:-false}"
fi

pkill -f 'bookapp.*\.jar' || true
pkill -f 'java -jar.*\.jar' || true

JAR_FILE=$(ls bookapp-*.jar 2>/dev/null | grep -v plain | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "No executable jar found"
  ls -al "$APP_DIR"
  exit 1
fi

echo "Using jar file: $JAR_FILE"
echo "Database engine: $DB_ENGINE_LOWER"

nohup java -jar "$JAR_FILE" \
  --server.servlet.context-path=/api \
  > "$LOG_FILE" 2>&1 &

sleep 10

pgrep -f "$JAR_FILE" || {
  echo "Backend failed to start"
  tail -n 100 "$LOG_FILE" || true
  exit 1
}

echo "Backend started"
