@echo off
chcp 65001 >nul
echo ========================================================
echo  Inicializador do Sistema Psico (Lumina)
echo ========================================================
echo.
echo Escolha o modo de inicialização:
echo  1. Iniciar com Docker Compose (PostgreSQL + API Docker)
echo  2. Iniciar Desenvolvimento Local Nativo (PHP Serve + Vite)
echo.
set /p MODO="Digite a opção desejada (1 ou 2): "

if "%MODO%"=="1" (
    echo.
    echo ==> Iniciando containers Docker...
    cd sistema-psico
    docker compose up -d --build
    cd ..
    echo.
    echo ==> Iniciando Front-end Vite...
    cd Portifolio-YasV2
    npm run dev
) else (
    echo.
    echo ==> Iniciando Backend Laravel na porta 8000...
    start cmd /k "cd sistema-psico && php artisan serve --port=8000"
    echo ==> Iniciando Front-end Vite na porta 5173...
    cd Portifolio-YasV2
    npm run dev
)
