#!/bin/bash
set -e

APP_ROOT=/var/www/my-angular-project
NGINX_CONF=/etc/nginx/conf.d/my-angular-project.conf

if id nginx >/dev/null 2>&1; then
  NGINX_USER=nginx
elif id www-data >/dev/null 2>&1; then
  NGINX_USER=www-data
else
  NGINX_USER=root
fi

mkdir -p "$APP_ROOT"

cat > "$NGINX_CONF" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root $APP_ROOT;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri /index.html;
    }
}
EOF

chown -R "$NGINX_USER:$NGINX_USER" "$APP_ROOT" || true
chmod -R 755 "$APP_ROOT"
nginx -t
systemctl restart nginx
