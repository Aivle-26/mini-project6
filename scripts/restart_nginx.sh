#!/bin/bash
mkdir -p /var/www/my-angular-project
chown -R nginx:nginx /var/www/my-angular-project || true
chmod -R 755 /var/www/my-angular-project
nginx -t
systemctl restart nginx
