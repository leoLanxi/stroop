#!/bin/sh
set -e
APP_DIR=${APP_DIR:-/var/www/stoop}
DOMAIN=${DOMAIN:-stroop.yourdomain.com}
sudo mkdir -p "$APP_DIR"
sudo chown "$USER":"$USER" "$APP_DIR"
cd "$APP_DIR"
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install gunicorn flask mysql-connector-python bcrypt flask-cors python-dotenv
if [ ! -f .env ]; then
  echo "MYSQL_HOST=127.0.0.1" > .env
  echo "MYSQL_PORT=3306" >> .env
  echo "MYSQL_USER=stroop" >> .env
  echo "MYSQL_PASSWORD=CHANGE_ME" >> .env
  echo "MYSQL_DB=stroop_db" >> .env
  echo "SECRET_KEY=$(openssl rand -hex 16)" >> .env
fi
sudo cp server/deploy/stroop-backend.service /etc/systemd/system/stroop-backend.service
sudo systemctl daemon-reload
sudo systemctl enable stroop-backend
sudo systemctl restart stroop-backend
sudo cp server/deploy/nginx-stoop.conf /etc/nginx/sites-available/stoop
sudo ln -sf /etc/nginx/sites-available/stoop /etc/nginx/sites-enabled/stoop
sudo nginx -t
sudo systemctl reload nginx
echo "Backend and nginx configured for domain: $DOMAIN"

