"use strict";

document.addEventListener(
    "DOMContentLoaded",
    carregarPaginaArranjo
);


async function carregarPaginaArranjo() {
    try {
        const resposta =
            await fetch("data/arranjo-campo.json");

        if (!resposta.ok) {
            throw new Error(
                `HTTP ${resposta.status}`
            );
        }

        const dados =
            await resposta.json();


        preencherProgramacaoSemanal(
            dados.programacaoSemanal
        );


        preencherDirigentes(
            dados.dirigentesFimDeSemana
        );


        preencherObservacoes(
            dados.observacoes
        );
        preencherDisplays(
    dados.displays
);

preencherLocaisSugeridos(
    dados.locaisSugeridos
);


        const proximo =
            encontrarProximoArranjo(
                dados.programacaoSemanal,
                dados.dirigentesFimDeSemana
            );


        if (proximo) {
            preencher(
                "[data-campo='proximoDia']",
                proximo.dia
            );

            preencher(
                "[data-campo='proximoHorario']",
                proximo.horario
            );

            preencher(
                "[data-campo='proximoLocal']",
                proximo.local
            );

            preencher(
                "[data-campo='proximoDirigente']",
                proximo.dirigente
            );
        }

    } catch (erro) {
        console.error(
            "Erro ao carregar página de Arranjo de Campo:",
            erro
        );
    }
}


/* =====================================================
   PROGRAMAÇÃO SEMANAL
===================================================== */

function preencherProgramacaoSemanal(programacao) {

    const container =
        document.querySelector(
            "[data-programacao-semanal]"
        );

    if (
        !container ||
        !Array.isArray(programacao)
    ) {
        return;
    }

    container.innerHTML = "";


    programacao.forEach(item => {

        const linha =
            document.createElement("div");

        linha.className =
            "field-schedule-row";


        linha.innerHTML = `
            <div class="field-schedule-day">
                ${item.dia || "—"}
            </div>

            <div class="field-schedule-time">
                ${item.horario || "—"}
            </div>

            <div class="field-schedule-leader">
                ${item.dirigente || "—"}
            </div>

            <div class="field-schedule-location">
                ${item.local || "—"}
            </div>
        `;


        container.appendChild(linha);
    });

}


/* =====================================================
   DIRIGENTES DE FINAL DE SEMANA
===================================================== */

function preencherDirigentes(lista) {

    const container =
        document.querySelector(
            "[data-dirigentes-fim-semana]"
        );

    if (
        !container ||
        !Array.isArray(lista)
    ) {
        return;
    }


    container.innerHTML = "";


    lista.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "weekend-leader-card";


        card.innerHTML = `
            <time>
                ${formatarData(item.data)}
            </time>

            <strong>
                ${item.dirigente || "—"}
            </strong>
        `;


        container.appendChild(card);
    });
}


/* =====================================================
   OBSERVAÇÕES
===================================================== */

function preencherObservacoes(observacoes) {

    const lista =
        document.querySelector(
            "[data-observacoes]"
        );

    if (
        !lista ||
        !Array.isArray(observacoes)
    ) {
        return;
    }


    lista.innerHTML = "";


    observacoes.forEach(texto => {

        const item =
            document.createElement("li");

        item.textContent = texto;

        lista.appendChild(item);
    });
}


/* =====================================================
   PRÓXIMO ARRANJO
===================================================== */

function encontrarProximoArranjo(programacao, escala) {

    if (!Array.isArray(programacao)) {
        return null;
    }

    if (!Array.isArray(escala)) {
        escala = [];
    }

    const dias = {
        "Domingo": 0,
        "Segunda-feira": 1,
        "Terça-feira": 2,
        "Quarta-feira": 3,
        "Quinta-feira": 4,
        "Sexta-feira": 5,
        "Sábado": 6
    };

    const agora = new Date();

    const diaAtual = agora.getDay();

    const minutosAtuais =
        agora.getHours() * 60 +
        agora.getMinutes();

    const candidatos = [];


    programacao.forEach(item => {

        if (!item.horario) {
            return;
        }

        if (!(item.dia in dias)) {
            return;
        }


        const partesHorario =
            item.horario.split(":");

        const hora =
            Number(partesHorario[0]);

        const minuto =
            Number(partesHorario[1]);


        if (
            Number.isNaN(hora) ||
            Number.isNaN(minuto)
        ) {
            return;
        }


        const horarioMinutos =
            hora * 60 + minuto;


        let diferencaDias =
            dias[item.dia] - diaAtual;


        if (diferencaDias < 0) {
            diferencaDias += 7;
        }


        /*
         * Se o arranjo é hoje, mas o horário
         * já passou, procuramos o mesmo dia
         * da próxima semana.
         */
        if (
            diferencaDias === 0 &&
            horarioMinutos <= minutosAtuais
        ) {
            diferencaDias = 7;
        }


        const dataArranjo =
            new Date(agora);

        dataArranjo.setHours(0, 0, 0, 0);

        dataArranjo.setDate(
            dataArranjo.getDate() +
            diferencaDias
        );


        let dirigente =
            item.dirigente || "A definir";


        /*
         * Sábado e domingo:
         * procura primeiro a escala específica
         * daquela data.
         */
        if (
            item.dia === "Sábado" ||
            item.dia === "Domingo"
        ) {

            const dataISO =
                formatarDataISO(dataArranjo);

            const registro =
                escala.find(
                    itemEscala =>
                        itemEscala.data === dataISO
                );


            if (registro?.dirigente) {
                dirigente =
                    registro.dirigente;
            }
        }


        candidatos.push({
            dia: item.dia,
            horario: item.horario,
            local: item.local || "A definir",
            dirigente: dirigente,
            data: dataArranjo,
            diferencaDias: diferencaDias,
            horarioMinutos: horarioMinutos
        });
    });


    candidatos.sort((a, b) => {

        if (
            a.diferencaDias !==
            b.diferencaDias
        ) {
            return (
                a.diferencaDias -
                b.diferencaDias
            );
        }

        return (
            a.horarioMinutos -
            b.horarioMinutos
        );
    });


    return candidatos[0] || null;
}


/* =====================================================
   UTILIDADES
===================================================== */

function preencher(seletor, valor) {

    const elemento =
        document.querySelector(seletor);

    if (elemento) {
        elemento.textContent =
            valor || "—";
    }
}


function formatarData(dataISO) {

    const [
        ano,
        mes,
        dia
    ] = dataISO.split("-");

    return `${dia}/${mes}/${ano}`;
}


function formatarDataISO(data) {

    const ano =
        data.getFullYear();

    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


/* =====================================================
   DISPLAYS
===================================================== */

function preencherDisplays(displays) {

    const container =
        document.querySelector(
            "[data-displays]"
        );

    if (
        !container ||
        !Array.isArray(displays)
    ) {
        return;
    }

    container.innerHTML = "";

    displays.forEach(item => {

        const card =
            document.createElement("article");

        card.className =
            "display-card";

        card.innerHTML = `
            <span class="display-name">
                ${item.nome || "Display"}
            </span>

            <strong>
                ${item.responsavel || "A definir"}
            </strong>

            <p>
                ${item.endereco || "Endereço a definir"}
            </p>
        `;

        container.appendChild(card);
    });
}


/* =====================================================
   LOCAIS SUGERIDOS
===================================================== */

function preencherLocaisSugeridos(locais) {

    const lista =
        document.querySelector(
            "[data-locais-sugeridos]"
        );

    if (
        !lista ||
        !Array.isArray(locais)
    ) {
        return;
    }

    lista.innerHTML = "";

    locais.forEach(local => {

        const item =
            document.createElement("li");

        item.textContent = local;

        lista.appendChild(item);
    });
}
