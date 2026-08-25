"use strict";


/* =====================================================
   ESTADO
===================================================== */

let territoriosDados = [];

let configuracaoTerritorios = {
    diasUsoProlongado: 30,
    diasSemUsoAlerta: 90
};

let filtroAtual = "todos";


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarTerritorios
);


async function iniciarTerritorios() {

    configurarFiltros();
    configurarPesquisa();
    configurarModalTerritorios();

    await carregarTerritorios();
}


/* =====================================================
   CARREGAR JSON
===================================================== */

async function carregarTerritorios() {

    try {

        const resposta = await fetch(
            `data/territorios.json?v=${Date.now()}`
        );


        if (!resposta.ok) {
            throw new Error(
                `HTTP ${resposta.status}`
            );
        }


        const dados =
            await resposta.json();


        configuracaoTerritorios = {
            ...configuracaoTerritorios,
            ...(dados.configuracao || {})
        };


        territoriosDados =
            Array.isArray(dados.territorios)
                ? dados.territorios
                : [];


        atualizarResumo();

        renderizarTerritorios();


        console.log(
            `Harmonia: ${territoriosDados.length} território(s) carregado(s).`
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar territórios:",
            erro
        );


        mostrarErroLista(
            "Não foi possível carregar os territórios."
        );
    }
}


/* =====================================================
   RESUMO
===================================================== */

function atualizarResumo() {

    const total =
        territoriosDados.length;


    const disponiveis =
        territoriosDados.filter(
            territorio =>
                territorio.status === "disponivel"
        ).length;


    const emUso =
        territoriosDados.filter(
            territorio =>
                territorio.status === "em-uso"
        ).length;


    const semUso =
        territoriosDados.filter(
            territorio =>
                estaSemUsoHaMuitoTempo(
                    territorio
                )
        ).length;


    preencherResumo(
        "total",
        total
    );

    preencherResumo(
        "disponiveis",
        disponiveis
    );

    preencherResumo(
        "emUso",
        emUso
    );

    preencherResumo(
        "semUso",
        semUso
    );
}


function preencherResumo(
    campo,
    valor
) {

    const elemento =
        document.querySelector(
            `[data-resumo="${campo}"]`
        );


    if (elemento) {
        elemento.textContent =
            valor;
    }
}


/* =====================================================
   RENDERIZAR
===================================================== */

function renderizarTerritorios() {

    const container =
        document.querySelector(
            "[data-territory-list]"
        );


    if (!container) {
        return;
    }


    const pesquisa =
        obterPesquisaAtual();


    const filtrados =
        territoriosDados.filter(
            territorio =>
                correspondePesquisa(
                    territorio,
                    pesquisa
                ) &&
                correspondeFiltro(
                    territorio
                )
        );


    container.innerHTML = "";


    if (filtrados.length === 0) {

        const vazio =
            document.createElement(
                "div"
            );


        vazio.className =
            "territory-empty";


        vazio.textContent =
            "Nenhum território encontrado.";


        container.appendChild(
            vazio
        );


        return;
    }


    filtrados.forEach(
        territorio => {

            const card =
                criarCardTerritorio(
                    territorio
                );


            container.appendChild(
                card
            );
        }
    );
}


/* =====================================================
   CARD
===================================================== */

function criarCardTerritorio(
    territorio
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "territory-card";


    const statusVisual =
        obterStatusVisual(
            territorio
        );


    const diasEmUso =
        calcularDiasEmUso(
            territorio
        );


    const diasSemUso =
        calcularDiasSemUso(
            territorio
        );


    const ultimaUtilizacao =
        formatarData(
            territorio.ultimaUtilizacao
        );


    const dataEntrega =
        formatarData(
            territorio.dataEntrega
        );


    let segundaInformacao = "";


    if (
        territorio.status ===
        "em-uso"
    ) {

        segundaInformacao = `
            <div class="territory-info-item">

                <span>
                    Em uso há
                </span>

                <strong>
                    ${
                        diasEmUso !== null
                            ? formatarDias(
                                diasEmUso
                            )
                            : "—"
                    }
                </strong>

            </div>
        `;

    } else {

        segundaInformacao = `
            <div class="territory-info-item">

                <span>
                    Sem uso há
                </span>

                <strong>
                    ${
                        diasSemUso !== null
                            ? formatarDias(
                                diasSemUso
                            )
                            : "Nunca utilizado"
                    }
                </strong>

            </div>
        `;
    }


    let primeiraInformacao = "";


    if (
        territorio.status ===
        "em-uso"
    ) {

        primeiraInformacao = `
            <div class="territory-info-item">

                <span>
                    Dirigente
                </span>

                <strong>
                    ${escaparHTML(
                        territorio.dirigenteAtual ||
                        "A definir"
                    )}
                </strong>

            </div>
        `;

    } else {

        primeiraInformacao = `
            <div class="territory-info-item">

                <span>
                    Última utilização
                </span>

                <strong>
                    ${ultimaUtilizacao}
                </strong>

            </div>
        `;
    }


    const informacaoExtra =
        territorio.status ===
        "em-uso"
            ? `
                <div class="territory-info-item">

                    <span>
                        Entregue em
                    </span>

                    <strong>
                        ${dataEntrega}
                    </strong>

                </div>
            `
            : "";


    const observacoes =
        territorio.observacoes
            ? `
                <p class="territory-card-note">
                    ${escaparHTML(
                        territorio.observacoes
                    )}
                </p>
            `
            : "";


    card.innerHTML = `
        <div class="territory-card-header">

            <div class="territory-card-title">

                <span>
                    Território
                    ${escaparHTML(
                        territorio.numero ||
                        String(
                            territorio.id
                        )
                    )}
                </span>

                <h3>
                    ${escaparHTML(
                        territorio.nome ||
                        "Território"
                    )}
                </h3>

                <p>
                    ${escaparHTML(
                        territorio.regiao ||
                        "Região não definida"
                    )}
                </p>

            </div>


            <span
                class="
                    territory-status
                    ${statusVisual.classe}
                "
            >
                ${statusVisual.texto}
            </span>

        </div>


        <div class="territory-card-info">

            ${primeiraInformacao}

            ${segundaInformacao}

            ${informacaoExtra}

        </div>


        ${observacoes}


        <div class="territory-card-actions">

            <button
                type="button"
                class="territory-action"
                data-territory-details="${territorio.id}"
            >
                Ver detalhes
            </button>

            ${
                territorio.status ===
                "disponivel"
                    ? `
                        <button
                            type="button"
                            class="
                                territory-action
                                primary
                            "
                            data-territory-deliver="${territorio.id}"
                        >
                            Entregar
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="
                                territory-action
                                primary
                            "
                            data-territory-return="${territorio.id}"
                        >
                            Devolver
                        </button>
                    `
            }

        </div>
    `;


    configurarAcoesCard(
        card,
        territorio
    );


    return card;
}


/* =====================================================
   STATUS VISUAL
===================================================== */

function obterStatusVisual(
    territorio
) {

    if (
        territorio.status ===
        "em-uso"
    ) {

        const dias =
            calcularDiasEmUso(
                territorio
            );


        if (
            dias !== null &&
            dias >=
                configuracaoTerritorios
                    .diasUsoProlongado
        ) {

            return {
                texto:
                    "Uso prolongado",
                classe:
                    "warning"
            };
        }


        return {
            texto:
                "Em uso",
            classe:
                "in-use"
        };
    }


    if (
        estaSemUsoHaMuitoTempo(
            territorio
        )
    ) {

        return {
            texto:
                "Sem uso",
            classe:
                "long-unused"
        };
    }


    return {
        texto:
            "Disponível",
        classe:
            "available"
    };
}


/* =====================================================
   FILTROS
===================================================== */

function configurarFiltros() {

    const botoes =
        document.querySelectorAll(
            "[data-filter]"
        );


    botoes.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    filtroAtual =
                        botao.dataset.filter;


                    botoes.forEach(
                        item =>
                            item.classList
                                .remove(
                                    "active"
                                )
                    );


                    botao.classList.add(
                        "active"
                    );


                    renderizarTerritorios();
                }
            );
        }
    );
}


function correspondeFiltro(
    territorio
) {

    if (
        filtroAtual ===
        "todos"
    ) {
        return true;
    }


    if (
        filtroAtual ===
        "disponivel"
    ) {

        return (
            territorio.status ===
            "disponivel"
        );
    }


    if (
        filtroAtual ===
        "em-uso"
    ) {

        return (
            territorio.status ===
            "em-uso"
        );
    }


    if (
        filtroAtual ===
        "alerta"
    ) {

        return (
            estaSemUsoHaMuitoTempo(
                territorio
            ) ||
            estaEmUsoProlongado(
                territorio
            )
        );
    }


    return true;
}


/* =====================================================
   PESQUISA
===================================================== */

function configurarPesquisa() {

    const campo =
        document.querySelector(
            "[data-territory-search]"
        );


    if (!campo) {
        return;
    }


    campo.addEventListener(
        "input",
        renderizarTerritorios
    );
}


function obterPesquisaAtual() {

    const campo =
        document.querySelector(
            "[data-territory-search]"
        );


    if (!campo) {
        return "";
    }


    return normalizarTexto(
        campo.value
    );
}


function correspondePesquisa(
    territorio,
    pesquisa
) {

    if (!pesquisa) {
        return true;
    }


    const texto =
        normalizarTexto(
            [
                territorio.numero,
                territorio.nome,
                territorio.regiao,
                territorio.dirigenteAtual
            ]
                .filter(Boolean)
                .join(" ")
        );


    return texto.includes(
        pesquisa
    );
}


/* =====================================================
   CÁLCULOS
===================================================== */

function calcularDiasEmUso(
    territorio
) {

    if (
        territorio.status !==
        "em-uso" ||
        !territorio.dataEntrega
    ) {
        return null;
    }


    return diferencaDias(
        territorio.dataEntrega,
        obterDataHoje()
    );
}


function calcularDiasSemUso(
    territorio
) {

    if (
        territorio.status ===
        "em-uso"
    ) {
        return null;
    }


    if (
        !territorio.ultimaUtilizacao
    ) {
        return null;
    }


    return diferencaDias(
        territorio.ultimaUtilizacao,
        obterDataHoje()
    );
}


function estaSemUsoHaMuitoTempo(
    territorio
) {

    const dias =
        calcularDiasSemUso(
            territorio
        );


    return (
        dias !== null &&
        dias >=
            configuracaoTerritorios
                .diasSemUsoAlerta
    );
}


function estaEmUsoProlongado(
    territorio
) {

    const dias =
        calcularDiasEmUso(
            territorio
        );


    return (
        dias !== null &&
        dias >=
            configuracaoTerritorios
                .diasUsoProlongado
    );
}


/* =====================================================
   DIFERENÇA DE DATAS
===================================================== */

function diferencaDias(
    dataInicial,
    dataFinal
) {

    const inicio =
        criarDataLocal(
            dataInicial
        );


    const fim =
        criarDataLocal(
            dataFinal
        );


    if (
        !inicio ||
        !fim
    ) {
        return null;
    }


    const diferenca =
        fim.getTime() -
        inicio.getTime();


    return Math.max(
        0,
        Math.floor(
            diferenca /
            86400000
        )
    );
}


/* =====================================================
   AÇÕES DOS CARDS
===================================================== */

/* =====================================================
   AÇÕES DOS CARDS
===================================================== */

function configurarAcoesCard(
    card,
    territorio
) {

    const detalhes =
        card.querySelector(
            "[data-territory-details]"
        );


    if (detalhes) {

        detalhes.addEventListener(
            "click",
            () => {

                mostrarDetalhes(
                    territorio
                );
            }
        );
    }


    const entregar =
        card.querySelector(
            "[data-territory-deliver]"
        );


    if (entregar) {

        entregar.addEventListener(
            "click",
            () => {

                abrirModalEntrega(
                    territorio
                );
            }
        );
    }


    const devolver =
        card.querySelector(
            "[data-territory-return]"
        );


    if (devolver) {

        devolver.addEventListener(
            "click",
            () => {

                abrirModalDevolucao(
                    territorio
                );
            }
        );
    }
}


/* =====================================================
   MODAL
===================================================== */

function abrirModal() {

    const modal =
        document.querySelector(
            "[data-territory-modal]"
        );


    if (!modal) {
        return;
    }


    modal.hidden = false;

    document.body.classList.add(
        "territory-modal-open"
    );
}


function fecharModal() {

    const modal =
        document.querySelector(
            "[data-territory-modal]"
        );


    const entrega =
        document.querySelector(
            "[data-form-delivery]"
        );


    const devolucao =
        document.querySelector(
            "[data-form-return]"
        );


    if (modal) {
        modal.hidden = true;
    }


    if (entrega) {
        entrega.hidden = true;
        entrega.reset();
    }


    if (devolucao) {
        devolucao.hidden = true;
        devolucao.reset();
    }


    document.body.classList.remove(
        "territory-modal-open"
    );
}


/* =====================================================
   ENTREGA
===================================================== */

function abrirModalEntrega(
    territorio
) {

    const formulario =
        document.querySelector(
            "[data-form-delivery]"
        );


    const devolucao =
        document.querySelector(
            "[data-form-return]"
        );


    const titulo =
        document.querySelector(
            "[data-modal-title]"
        );


    if (!formulario) {
        return;
    }


    if (devolucao) {
        devolucao.hidden = true;
    }


    formulario.hidden = false;


    if (titulo) {
        titulo.textContent =
            "Entregar território";
    }


    const id =
        formulario.querySelector(
            "[data-delivery-id]"
        );


    const nome =
        formulario.querySelector(
            "[data-delivery-territory]"
        );


    const data =
        formulario.querySelector(
            "[data-delivery-date]"
        );


    const dirigente =
        formulario.querySelector(
            "[data-delivery-leader]"
        );


    const observacao =
        formulario.querySelector(
            "[data-delivery-note]"
        );


    if (id) {
        id.value =
            territorio.id;
    }


    if (nome) {
        nome.textContent =
            `Território ${territorio.numero} — ${territorio.nome}`;
    }


    if (data) {
        data.value =
            obterDataHoje();
    }


    if (dirigente) {
        dirigente.value = "";
    }


    if (observacao) {
        observacao.value = "";
    }


    abrirModal();


    if (dirigente) {
        dirigente.focus();
    }
}


function confirmarEntrega(
    evento
) {

    evento.preventDefault();


    const formulario =
        evento.currentTarget;


    const id =
        Number(
            formulario.querySelector(
                "[data-delivery-id]"
            )?.value
        );


    const dirigente =
        formulario.querySelector(
            "[data-delivery-leader]"
        )?.value.trim();


    const data =
        formulario.querySelector(
            "[data-delivery-date]"
        )?.value;


    const observacao =
        formulario.querySelector(
            "[data-delivery-note]"
        )?.value.trim();


    const territorio =
        territoriosDados.find(
            item =>
                Number(item.id) === id
        );


    if (!territorio) {

        alert(
            "Território não encontrado."
        );

        return;
    }


    if (!dirigente) {

        alert(
            "Informe o nome do dirigente."
        );

        return;
    }


    if (!data) {

        alert(
            "Informe a data da entrega."
        );

        return;
    }


    if (
        territorio.status ===
        "em-uso"
    ) {

        alert(
            "Este território já está em uso."
        );

        return;
    }


    territorio.status =
        "em-uso";


    territorio.dirigenteAtual =
        dirigente;


    territorio.dataEntrega =
        data;


    territorio.dataDevolucao =
        null;


    territorio.ultimaUtilizacao =
        data;


    if (observacao) {

        territorio.observacoes =
            observacao;
    }


    if (
        !Array.isArray(
            territorio.historico
        )
    ) {

        territorio.historico = [];
    }


    territorio.historico.push({

        entregueEm: data,

        devolvidoEm: null,

        dirigente: dirigente,

        observacaoEntrega:
            observacao || "",

        observacaoDevolucao: ""
    });


    fecharModal();


    atualizarResumo();

    renderizarTerritorios();


    console.log(
        `Harmonia: Território ${territorio.numero} entregue para ${dirigente}.`
    );
}


/* =====================================================
   DEVOLUÇÃO
===================================================== */

function abrirModalDevolucao(
    territorio
) {

    const formulario =
        document.querySelector(
            "[data-form-return]"
        );


    const entrega =
        document.querySelector(
            "[data-form-delivery]"
        );


    const titulo =
        document.querySelector(
            "[data-modal-title]"
        );


    if (!formulario) {
        return;
    }


    if (entrega) {
        entrega.hidden = true;
    }


    formulario.hidden = false;


    if (titulo) {
        titulo.textContent =
            "Devolver território";
    }


    const id =
        formulario.querySelector(
            "[data-return-id]"
        );


    const nome =
        formulario.querySelector(
            "[data-return-territory]"
        );


    const dirigente =
        formulario.querySelector(
            "[data-return-leader]"
        );


    const entregaData =
        formulario.querySelector(
            "[data-return-delivery-date]"
        );


    const dias =
        formulario.querySelector(
            "[data-return-days]"
        );


    const devolucaoData =
        formulario.querySelector(
            "[data-return-date]"
        );


    const observacao =
        formulario.querySelector(
            "[data-return-note]"
        );


    if (id) {
        id.value =
            territorio.id;
    }


    if (nome) {
        nome.textContent =
            `Território ${territorio.numero}`;
    }


    if (dirigente) {
        dirigente.textContent =
            territorio.dirigenteAtual ||
            "—";
    }


    if (entregaData) {
        entregaData.textContent =
            formatarData(
                territorio.dataEntrega
            );
    }


    const totalDias =
        calcularDiasEmUso(
            territorio
        );


    if (dias) {

        dias.textContent =
            totalDias !== null
                ? formatarDias(
                    totalDias
                )
                : "—";
    }


    if (devolucaoData) {

        devolucaoData.value =
            obterDataHoje();
    }


    if (observacao) {
        observacao.value = "";
    }


    abrirModal();
}


function confirmarDevolucao(
    evento
) {

    evento.preventDefault();


    const formulario =
        evento.currentTarget;


    const id =
        Number(
            formulario.querySelector(
                "[data-return-id]"
            )?.value
        );


    const dataDevolucao =
        formulario.querySelector(
            "[data-return-date]"
        )?.value;


    const observacao =
        formulario.querySelector(
            "[data-return-note]"
        )?.value.trim();


    const territorio =
        territoriosDados.find(
            item =>
                Number(item.id) === id
        );


    if (!territorio) {

        alert(
            "Território não encontrado."
        );

        return;
    }


    if (
        territorio.status !==
        "em-uso"
    ) {

        alert(
            "Este território não está em uso."
        );

        return;
    }


    if (!dataDevolucao) {

        alert(
            "Informe a data da devolução."
        );

        return;
    }


    if (
        territorio.dataEntrega &&
        dataDevolucao <
            territorio.dataEntrega
    ) {

        alert(
            "A data da devolução não pode ser anterior à data da entrega."
        );

        return;
    }


    territorio.status =
        "disponivel";


    territorio.dataDevolucao =
        dataDevolucao;


    territorio.ultimaUtilizacao =
        dataDevolucao;


    const dirigenteAnterior =
        territorio.dirigenteAtual;


    territorio.dirigenteAtual =
        null;


    territorio.dataEntrega =
        null;


    if (
        !Array.isArray(
            territorio.historico
        )
    ) {

        territorio.historico = [];
    }


    const movimentoAberto =
        [...territorio.historico]
            .reverse()
            .find(
                item =>
                    !item.devolvidoEm
            );


    if (movimentoAberto) {

        movimentoAberto.devolvidoEm =
            dataDevolucao;


        movimentoAberto.observacaoDevolucao =
            observacao || "";
    }


    if (observacao) {

        territorio.observacoes =
            observacao;
    }


    fecharModal();


    atualizarResumo();

    renderizarTerritorios();


    console.log(
        `Harmonia: Território ${territorio.numero} devolvido. Dirigente anterior: ${dirigenteAnterior || "—"}`
    );
}


/* =====================================================
   EVENTOS DO MODAL
===================================================== */

function configurarModalTerritorios() {

    const botoesFechar =
        document.querySelectorAll(
            "[data-modal-close]"
        );


    botoesFechar.forEach(
        botao => {

            botao.addEventListener(
                "click",
                fecharModal
            );
        }
    );


    const formularioEntrega =
        document.querySelector(
            "[data-form-delivery]"
        );


    if (formularioEntrega) {

        formularioEntrega.addEventListener(
            "submit",
            confirmarEntrega
        );
    }


    const formularioDevolucao =
        document.querySelector(
            "[data-form-return]"
        );


    if (formularioDevolucao) {

        formularioDevolucao.addEventListener(
            "submit",
            confirmarDevolucao
        );
    }


    document.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Escape"
            ) {

                fecharModal();
            }
        }
    );
}

/* =====================================================
   DETALHES
===================================================== */

function mostrarDetalhes(
    territorio
) {

    const linhas = [

        `Território ${territorio.numero}`,

        territorio.nome,

        `Região: ${
            territorio.regiao ||
            "A definir"
        }`,

        `Status: ${
            territorio.status ===
            "em-uso"
                ? "Em uso"
                : "Disponível"
        }`
    ];


    if (
        territorio.dirigenteAtual
    ) {

        linhas.push(
            `Dirigente: ${territorio.dirigenteAtual}`
        );
    }


    if (
        territorio.dataEntrega
    ) {

        linhas.push(
            `Entregue em: ${formatarData(
                territorio.dataEntrega
            )}`
        );
    }


    if (
        territorio.ultimaUtilizacao
    ) {

        linhas.push(
            `Última utilização: ${formatarData(
                territorio.ultimaUtilizacao
            )}`
        );
    }


    if (
        territorio.observacoes
    ) {

        linhas.push(
            `Observações: ${territorio.observacoes}`
        );
    }


    linhas.push(
        `Histórico: ${
            Array.isArray(
                territorio.historico
            )
                ? territorio
                    .historico
                    .length
                : 0
        } movimentação(ões)`
    );


    alert(
        linhas.join("\n")
    );
}


/* =====================================================
   UTILIDADES
===================================================== */

function obterDataHoje() {

    const agora =
        new Date();


    const ano =
        agora.getFullYear();


    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            agora.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${ano}-${mes}-${dia}`;
}


function criarDataLocal(
    valor
) {

    if (!valor) {
        return null;
    }


    const partes =
        valor
            .split("-")
            .map(Number);


    if (
        partes.length !== 3
    ) {
        return null;
    }


    const [
        ano,
        mes,
        dia
    ] = partes;


    return new Date(
        ano,
        mes - 1,
        dia
    );
}


function formatarData(
    valor
) {

    if (!valor) {
        return "—";
    }


    const partes =
        valor.split("-");


    if (
        partes.length !== 3
    ) {
        return valor;
    }


    return `${
        partes[2]
    }/${
        partes[1]
    }/${
        partes[0]
    }`;
}


function formatarDias(
    dias
) {

    if (dias === 0) {
        return "Hoje";
    }


    if (dias === 1) {
        return "1 dia";
    }


    return `${dias} dias`;
}


function normalizarTexto(
    texto
) {

    return String(
        texto || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .trim();
}


function escaparHTML(
    valor
) {

    return String(
        valor || ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =====================================================
   ERRO
===================================================== */

function mostrarErroLista(
    mensagem
) {

    const container =
        document.querySelector(
            "[data-territory-list]"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `
        <div class="territory-empty">
            ${escaparHTML(
                mensagem
            )}
        </div>
    `;
}