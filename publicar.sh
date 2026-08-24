#!/bin/bash

set -e

echo
echo "======================================"
echo "       HARMONIA - PUBLICAÇÃO"
echo "======================================"
echo

cd "$(dirname "$0")"


# --------------------------------------
# Verifica a branch
# --------------------------------------

BRANCH=$(git branch --show-current)

if [ "$BRANCH" != "main" ]; then
    echo "ERRO: você está na branch '$BRANCH'."
    echo
    echo "A publicação só pode ser feita pela main."
    echo
    echo "Use:"
    echo "git switch main"
    echo
    exit 1
fi


# --------------------------------------
# Valida os arquivos JSON
# --------------------------------------

echo "Validando arquivos JSON..."
echo

JSONS=(
    "data/meio-semana.json"
    "data/final-semana.json"
    "data/arranjo-campo.json"
)

for arquivo in "${JSONS[@]}"; do

    if [ ! -f "$arquivo" ]; then
        echo "ERRO: arquivo não encontrado:"
        echo "$arquivo"
        exit 1
    fi

    if ! python3 -m json.tool "$arquivo" > /dev/null 2>&1; then
        echo
        echo "ERRO no JSON:"
        echo "$arquivo"
        echo
        echo "Publicação cancelada."
        exit 1
    fi

    echo "OK - $arquivo"

done

echo
echo "Todos os JSONs estão válidos."
echo


# --------------------------------------
# Verifica alterações
# --------------------------------------

if git diff --quiet &&
   git diff --cached --quiet &&
   [ -z "$(git ls-files --others --exclude-standard)" ]; then

    echo "Nenhuma alteração encontrada."
    echo
    exit 0
fi


echo "Alterações encontradas:"
echo

git status --short

echo


# --------------------------------------
# Adiciona tudo
# --------------------------------------

echo "Preparando alterações..."
echo

git add -A


# --------------------------------------
# Commit local
# --------------------------------------

DATA=$(date '+%d/%m/%Y %H:%M')

git commit -m "Atualiza Harmonia - $DATA"


# --------------------------------------
# Atualiza com GitHub
# --------------------------------------

echo
echo "Verificando atualizações do GitHub..."
echo

git pull --rebase origin main


# --------------------------------------
# Publica
# --------------------------------------

echo
echo "Enviando alterações para o GitHub..."
echo

git push origin main


# --------------------------------------
# Confirma resultado
# --------------------------------------

echo
echo "======================================"
echo "     PUBLICAÇÃO CONCLUÍDA"
echo "======================================"
echo
echo "Branch: main"
echo "Data: $DATA"
echo
echo "GitHub atualizado com sucesso."
echo