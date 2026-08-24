#!/bin/bash

set -e

echo
echo "======================================"
echo "       HARMONIA - PUBLICAÇÃO"
echo "======================================"
echo

# Garante que estamos dentro do repositório
cd "$(dirname "$0")"

# Verifica se existem alterações
if git diff --quiet && git diff --cached --quiet && \
   [ -z "$(git ls-files --others --exclude-standard)" ]; then

    echo "Nenhuma alteração encontrada."
    echo
    exit 0
fi

echo "Alterações encontradas:"
echo
git status --short
echo

# Adiciona todas as alterações
git add -A

# Mensagem automática com data e hora
DATA=$(date '+%d/%m/%Y %H:%M')

git commit -m "Atualiza programação - $DATA"

echo
echo "Atualizando repositório remoto..."
echo

git pull --rebase origin main

git push origin main

echo
echo "======================================"
echo " PUBLICAÇÃO CONCLUÍDA COM SUCESSO"
echo "======================================"
echo
echo "As alterações foram enviadas para:"
echo "origin/main"
echo