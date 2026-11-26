#!/bin/sh
set -e

# Define a porta dinâmica (padrão Render ou 8080)
export PORT="${PORT:-8080}"
echo "==> Inicializando backend Lumina na porta $PORT..."

# Substitui a porta no arquivo de configuração do Nginx
if [ -f /etc/nginx/http.d/default.conf.template ]; then
    envsubst '$PORT' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf
elif [ -f /etc/nginx/conf.d/default.conf.template ]; then
    envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Ajusta permissões dos diretórios de cache e storage
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true

# Executa migrações automáticas em produção
echo "==> Executando migrations do banco de dados..."
php artisan migrate --force || echo "Aviso: Migrações não puderam ser executadas ou banco de dados indisponível no momento."

# Se configurado para rodar seeds
if [ "$RUN_SEEDER" = "true" ]; then
    echo "==> Executando DatabaseSeeder..."
    php artisan db:seed --force || echo "Aviso: Seeder falhou."
fi

# Otimizações de cache do Laravel
echo "==> Otimizando caches do Laravel..."
php artisan config:cache || true
php artisan route:cache || true

# Inicia o PHP-FPM em segundo plano
echo "==> Iniciando PHP-FPM..."
php-fpm -D

# Inicia o Nginx em primeiro plano
echo "==> Servidor pronto! Iniciando Nginx..."
exec nginx -g "daemon off;"
