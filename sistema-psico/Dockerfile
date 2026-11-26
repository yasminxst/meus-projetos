# ==========================================
# DOCKERFILE PRODUÇÃO - SISTEMA PSICO (LARAVEL 13)
# Base: PHP 8.5 FPM Alpine + Nginx + PostgreSQL
# Otimizado para Render Web Service
# ==========================================
FROM php:8.5-fpm-alpine

# Instala dependências de sistema, Nginx, PostgreSQL dev libs e gettext (envsubst)
RUN apk add --no-cache \
    nginx \
    gettext \
    nodejs \
    npm \
    postgresql-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    git \
    unzip \
    curl

# Configura e instala extensões PHP essenciais
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j1 \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        gd \
        intl \
        bcmath \
        opcache

# Instala Composer a partir da imagem oficial
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Define diretório de trabalho
WORKDIR /var/www/html

# Copia arquivos de dependência primeiro para aproveitar cache de camadas
COPY composer.json composer.lock ./

# Instala dependências PHP sem scripts ainda (para evitar erros de artisan antes de copiar todo o código)
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# Instala dependências JavaScript antes de copiar o código para aproveitar o cache
COPY package.json package-lock.json ./
RUN npm ci

# Copia todo o código-fonte da aplicação
COPY . .

# Finaliza as dependências PHP e compila os assets do frontend
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && npm run build \
    && rm -rf node_modules /root/.npm

# Configura o Nginx com o template
COPY nginx.conf /etc/nginx/http.d/default.conf.template

# Copia e concede permissão de execução ao script de entrada
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Garante permissões adequadas para storage e cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Porta padrão de escuta (o Render define PORT dinamicamente)
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
