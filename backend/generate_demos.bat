@echo off
REM Script para gerar demonstrações de IA do drone no Windows

REM Verificar se o Python está instalado
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python não encontrado. Por favor, instale o Python.
    exit /b 1
)

REM Verificar se as dependências estão instaladas
echo Verificando dependências...
python -c "import cv2, numpy" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Instalando dependências...
    pip install opencv-python numpy
)

REM Criar diretório para vídeos de demonstração
if not exist demo_videos mkdir demo_videos

REM Executar geração de demonstrações
echo Gerando demonstrações de IA do drone...
python generate_demo.py --frames 90 --output demo_videos

echo Demonstrações geradas com sucesso!
echo Os vídeos estão disponíveis no diretório 'demo_videos'
pause

