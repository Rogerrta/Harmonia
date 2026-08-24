"use strict";

document.addEventListener("DOMContentLoaded", carregarArranjoCampo);

async function carregarArranjoCampo() {
    const bloco = document.querySelector("[data-arranjo-campo]");

    if (!bloco) {
        return;
    }

    try {
        const resposta = await fetch(
    `data/arranjo-campo.json?v=${Date.now()}`
);

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        const proximo = encontrarProximoArranjo(
            dados.programacaoSemanal,
            dados.dirigentesFimDeSemana
        );

        if (!proximo) {
            preencher(
                "[data-arranjo='dia']",
                "Nenhum arranjo disponível"
            );

            preencher(
                "[data-arranjo='horario']",
                "—"
            );

            preencher(
                "[data-arranjo='dirigente']",
                "—"
            );

            preencher(
                "[data-arranjo='local']",
                "—"
            );

            return;
        }

        preencher(
            "[data-arranjo='dia']",
            proximo.dia
        );

        preencher(
            "[data-arranjo='horario']",
            proximo.horario || "—"
        );

        preencher(
            "[data-arranjo='dirigente']",
            proximo.dirigente || "A definir"
        );

        preencher(
            "[data-arranjo='local']",
            proximo.local || "A definir"
        );

        console.log(
            "Harmonia: próximo arranjo carregado:",
            proximo
        );

    } catch (erro) {
        console.error(
            "Erro ao carregar Arranjo de Campo:",
            erro
        );
    }
}


/* =====================================================
   LOCALIZA O PRÓXIMO ARRANJO
===================================================== */

function encontrarProximoArranjo(
    programacao,
    escalaFimDeSemana
) {
    if (!Array.isArray(programacao)) {
        return null;
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

        if (
            !item.horario ||
            !(item.dia in dias)
        ) {
            return;
        }


        const [hora, minuto] =
            item.horario
                .split(":")
                .map(Number);

        const horarioEmMinutos =
            hora * 60 + minuto;


        let diferencaDias =
            dias[item.dia] - diaAtual;


        if (diferencaDias < 0) {
            diferencaDias += 7;
        }


        if (
            diferencaDias === 0 &&
            horarioEmMinutos <= minutosAtuais
        ) {
            diferencaDias = 7;
        }


        const dataArranjo =
            criarDataFutura(
                agora,
                diferencaDias
            );


        let dirigente =
            item.dirigente;


        /*
         * Sábado e domingo podem possuir
         * dirigente específico na escala.
         */

        if (
            item.dia === "Sábado" ||
            item.dia === "Domingo"
        ) {
            const dirigenteEscala =
                buscarDirigentePorData(
                    dataArranjo,
                    escalaFimDeSemana
                );

            if (dirigenteEscala) {
                dirigente =
                    dirigenteEscala;
            }
        }


        candidatos.push({
            dia: item.dia,
            horario: item.horario,
            local: item.local,
            dirigente,
            data: dataArranjo,
            diferencaDias,
            horarioEmMinutos
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
            a.horarioEmMinutos -
            b.horarioEmMinutos
        );
    });


    return candidatos[0] || null;
}


/* =====================================================
   CRIA A DATA DO PRÓXIMO ARRANJO
===================================================== */

function criarDataFutura(
    dataBase,
    diasAdicionar
) {
    const novaData =
        new Date(dataBase);

    novaData.setHours(
        0,
        0,
        0,
        0
    );

    novaData.setDate(
        novaData.getDate() +
        diasAdicionar
    );

    return novaData;
}


/* =====================================================
   PROCURA DIRIGENTE PELA DATA
===================================================== */

function buscarDirigentePorData(
    data,
    escala
) {
    if (!Array.isArray(escala)) {
        return null;
    }

    const dataISO =
        formatarDataISO(data);

    const registro =
        escala.find(
            item =>
                item.data === dataISO
        );

    return registro
        ? registro.dirigente
        : null;
}


/* =====================================================
   CONVERTE DATA PARA YYYY-MM-DD
===================================================== */

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
   PREENCHIMENTO DO HTML
===================================================== */

function preencher(
    seletor,
    valor
) {
    const elemento =
        document.querySelector(
            seletor
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        valor ?? "—";
}