@echo off
chcp 65001 >nul
echo ========================================================
echo  Instalador do Docker Desktop para Windows (Lumina)
echo ========================================================
echo.
echo Iniciando o download e instalação do Docker Desktop via Windows Package Manager (winget)...
echo.
winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
echo.
if %errorlevel% neq 0 (
    echo [AVISO] Se o winget solicitou permissão de Administrador, execute este arquivo como Administrador.
    echo Você também pode baixar o instalador oficial diretamente pelo link:
    echo https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe
) else (
    echo [SUCESSO] Docker Desktop instalado com sucesso!
    echo Lembre-se de reiniciar o computador caso seja a primeira vez instalando o WSL2/Hyper-V.
)
echo.
pause
