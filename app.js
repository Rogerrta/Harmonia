"use strict";

/* =====================================================
   HARMONIA
   Carregamento da programação do meio de semana
===================================================== */

document.addEventListener("DOMContentLoaded", iniciarProgramacao);


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

async function iniciarProgramacao() {
    const pagina = document.querySelector("[data-week]");

    if (!pagina) {
        return;
    }

    const numeroSemana = Number(pagina.dataset.week);

    if (!numeroSemana) {
        console.error("Número da semana inválido.");
        return;
    }

    try {
        const resposta = await fetch("data/meio-semana.json");

        if (!resposta.ok) {
            throw new Error(
                `Erro ao carregar JSON: HTTP ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        const semana = dados.semanas.find(
            item => item.id === numeroSemana
        );

        if (!semana) {
            throw new Error(
                `Semana ${numeroSemana} não encontrada.`
            );
        }

        preencherSemana(semana);

        console.log(
            `Harmonia: Semana ${numeroSemana} carregada com sucesso.`
        );

    } catch (erro) {
        console.error(
            "Harmonia: não foi possível carregar a programação.",
            erro
        );
    }
}


/* =====================================================
   FUNÇÕES AUXILIARES
===================================================== */

function definirTexto(seletor, valor, padrao = "A definir") {
    const elemento = document.querySelector(seletor);

    if (!elemento) {
        return;
    }

    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        elemento.textContent = padrao;
        return;
    }

    elemento.textContent = valor;
}


function definirCantico(seletor, numero) {
    definirTexto(
        seletor,
        numero,
        "—"
    );
}


/* =====================================================
   PREENCHIMENTO DA SEMANA
===================================================== */

function preencherSemana(semana) {

    /* -------------------------------------------------
       CABEÇALHO
    ------------------------------------------------- */

    definirTexto(
        "[data-field='periodo']",
        semana.periodo
    );

    definirTexto(
        "[data-field='leituraBiblica']",
        semana.leituraBiblica
    );


    /* -------------------------------------------------
       RESPONSÁVEIS
    ------------------------------------------------- */

    definirTexto(
        "[data-field='presidente']",
        semana.presidente
    );

    definirTexto(
        "[data-field='conselheiro']",
        semana.conselheiro,
        "—"
    );


    /* -------------------------------------------------
       ABERTURA
    ------------------------------------------------- */

    if (semana.abertura) {

        definirCantico(
            "[data-field='canticoInicial']",
            semana.abertura.cantico
        );

        definirTexto(
            "[data-field='oracaoInicial']",
            semana.abertura.oracao
        );

        definirTexto(
            "[data-field='comentariosIniciais']",
            semana.abertura.comentarios
        );
    }


    /* -------------------------------------------------
       TESOUROS
    ------------------------------------------------- */

    preencherLista(
        "tesouros",
        semana.tesouros
    );


    /* -------------------------------------------------
       MINISTÉRIO
    ------------------------------------------------- */

    preencherLista(
        "ministerio",
        semana.ministerio
    );


    /* -------------------------------------------------
       NOSSA VIDA CRISTÃ
    ------------------------------------------------- */

    if (semana.vidaCrista) {

        definirCantico(
            "[data-field='canticoVidaCrista']",
            semana.vidaCrista.cantico
        );

        preencherLista(
            "vidaCrista",
            semana.vidaCrista.partes
        );
    }


    /* -------------------------------------------------
       ENCERRAMENTO
    ------------------------------------------------- */

    if (semana.encerramento) {

        definirTexto(
            "[data-field='comentariosFinais']",
            semana.encerramento.comentarios
        );

        definirCantico(
            "[data-field='canticoFinal']",
            semana.encerramento.cantico
        );

        definirTexto(
            "[data-field='oracaoFinal']",
            semana.encerramento.oracao
        );
    }
}


/* =====================================================
   LISTAS DE PARTES
===================================================== */

function preencherLista(tipo, itens) {

    if (!Array.isArray(itens)) {
        return;
    }

    itens.forEach((item, indice) => {

        const numero = indice + 1;


        /* Título */

        definirTexto(
            `[data-field='${tipo}${numero}Titulo']`,
            item.titulo
        );


        /* Subtítulo */

        definirTexto(
            `[data-field='${tipo}${numero}Subtitulo']`,
            item.subtitulo,
            ""
        );


        /* Tempo */

        definirTexto(
            `[data-field='${tipo}${numero}Tempo']`,
            item.tempo
        );


        /* Designado */

        definirTexto(
            `[data-field='${tipo}${numero}Designado']`,
            item.designado
        );


        /* Ajudante */

        definirTexto(
            `[data-field='${tipo}${numero}Ajudante']`,
            item.ajudante,
            ""
        );


        /* Leitor */

        definirTexto(
            `[data-field='${tipo}${numero}Leitor']`,
            item.leitor,
            ""
        );
    });
}