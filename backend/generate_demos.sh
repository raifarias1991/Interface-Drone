#!/bin/bash

# Script para gerar demonstrações de IA do drone

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "Python 3 não encontrado. Por favor, instale o Python 3."
    exit 1
fi

# Verificar se as dependências estão instaladas
echo "Verificando dependências..."
python3 -c "import cv2, numpy" 2>/dev/null || {
    echo "Instalando dependências..."
    pip install opencv-python numpy
}

# Criar diretório para vídeos de demonstração
mkdir -p demo_videos

# Executar geração de demonstrações
echo "Gerando demonstrações de IA do drone..."
python3 generate_demo.py --frames 60 --output demo_videos

echo "Demonstrações geradas com sucesso!"
echo "Os vídeos estão disponíveis no diretório 'demo_videos'"

