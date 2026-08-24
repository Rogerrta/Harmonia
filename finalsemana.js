"use strict";

document.addEventListener("DOMContentLoaded", carregarFinalSemana);

async function carregarFinalSemana() {
    try {
        const resposta = await fetch(
            `data/final-semana.json?v=${Date.now()}`
        );

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        const semana = dados.semanas?.[0];

        if (!semana) {
            throw new Error("Nenhuma programação encontrada.");
        }

        preencher("[data-final='data']", semana.data);
        preencher("[data-final='presidente']", semana.presidente);

        preencher(
            "[data-final='oracaoInicial']",
            semana.abertura?.oracao
        );

        preencher(
            "[data-final='canticoInicial']",
            semana.abertura?.cantico
        );
        preencher(
             "[data-final='canticoIntermediario']",
             semana.sentinela?.cantico
        );

        preencher(
            "[data-final='temaDiscurso']",
            semana.discursoPublico?.tema
        );

        preencher(
            "[data-final='orador']",
            semana.discursoPublico?.orador
        );

        preencher(
            "[data-final='congregacaoOrador']",
            semana.discursoPublico?.congregacao
        );

        preencher(
            "[data-final='artigoSentinela']",
            semana.sentinela?.artigo
        );

        preencher(
            "[data-final='temaSentinela']",
            semana.sentinela?.tema
        );

        preencher(
            "[data-final='dirigenteSentinela']",
            semana.sentinela?.dirigente
        );

        preencher(
            "[data-final='leitorSentinela']",
            semana.sentinela?.leitor
        );

        preencher(
            "[data-final='canticoFinal']",
            semana.encerramento?.cantico
        );

        preencher(
            "[data-final='oracaoFinal']",
            semana.encerramento?.oracao
        );

        console.log("Harmonia: final de semana carregado.");

    } catch (erro) {
        console.error(
            "Erro ao carregar programação do final de semana:",
            erro
        );
    }
}

function preencher(seletor, valor) {
    const elemento = document.querySelector(seletor);

    if (!elemento) {
        return;
    }

    elemento.textContent =
        valor === null ||
        valor === undefined ||
        valor === ""
            ? "A definir"
            : valor;
}