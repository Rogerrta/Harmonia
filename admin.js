"use strict";


/* =====================================================
   CONFIGURAÇÃO
===================================================== */

/*
 * IMPORTANTE:
 * Cole aqui o MESMO hash SHA-256 que você já estava
 * usando no admin.js anterior.
 */

const ADMIN_PASSWORD_HASH =
    "2ff9100c290d3c9f31003fe08b460765940ff9f3917e7e888f4aa05f4fc4960f";


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    iniciarAdmin
);


function iniciarAdmin() {

    const login =
        document.querySelector(
            "[data-admin-login]"
        );

    const dashboard =
        document.querySelector(
            "[data-admin-dashboard]"
        );

    const formulario =
        document.querySelector(
            "[data-login-form]"
        );

    const erro =
        document.querySelector(
            "[data-login-error]"
        );

    const logout =
        document.querySelector(
            "[data-admin-logout]"
        );


    if (
        !login ||
        !dashboard ||
        !formulario
    ) {

        console.error(
            "Harmonia Admin: elementos do painel não encontrados."
        );

        return;
    }


    /* Verifica sessão ativa */

    if (
        sessionStorage.getItem(
            "harmonia-admin"
        ) === "1"
    ) {

        abrirPainel(
            login,
            dashboard
        );
    }


    /* =================================================
       LOGIN
    ================================================= */

    formulario.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            const campoSenha =
                document.querySelector(
                    "#admin-password"
                );


            if (!campoSenha) {
                return;
            }


            const hash =
                await gerarHash(
                    campoSenha.value
                );


            if (
                hash ===
                ADMIN_PASSWORD_HASH
            ) {

                sessionStorage.setItem(
                    "harmonia-admin",
                    "1"
                );


                if (erro) {
                    erro.hidden = true;
                }


                campoSenha.value = "";


                abrirPainel(
                    login,
                    dashboard
                );

            } else {

                if (erro) {
                    erro.hidden = false;
                }


                campoSenha.select();
            }
        }
    );


    /* =================================================
       LOGOUT
    ================================================= */

    if (logout) {

        logout.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "harmonia-admin"
                );


                dashboard.hidden = true;
                login.hidden = false;


                fecharEditores();


                const campoSenha =
                    document.querySelector(
                        "#admin-password"
                    );


                if (campoSenha) {
                    campoSenha.focus();
                }
            }
        );
    }


    configurarMenuAdmin();
    configurarEditorAnuncios();
    configurarEditorTerritorios();
}


/* =====================================================
   ABRIR PAINEL
===================================================== */

function abrirPainel(
    login,
    dashboard
) {

    login.hidden = true;
    dashboard.hidden = false;


    console.log(
        "Harmonia Admin: acesso autorizado."
    );
}


/* =====================================================
   SHA-256
===================================================== */

async function gerarHash(texto) {

    const dados =
        new TextEncoder()
            .encode(texto);


    const resultado =
        await crypto.subtle.digest(
            "SHA-256",
            dados
        );


    return Array
        .from(
            new Uint8Array(resultado)
        )
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}


/* =====================================================
   MENU PRINCIPAL
===================================================== */

function configurarMenuAdmin() {

    const botoes =
        document.querySelectorAll(
            "[data-admin-section]"
        );


    botoes.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const secao =
                    botao.dataset.adminSection;


                console.log(
                    `Harmonia Admin: seção ${secao}`
                );


                if (secao === "anuncios") {

                    abrirEditorAnuncios();

                    return;
                }
                if (secao === "territorios") {
                
                    abrirEditorTerritorios();
                    
                    return;
                }

                /*
                 * As demais seções serão
                 * implementadas posteriormente.
                 */

                console.log(
                    `Editor "${secao}" ainda não implementado.`
                );
            }
        );
    });
}


/* =====================================================
   EDITOR DE ANÚNCIOS
===================================================== */

let anunciosAdmin = [];


async function abrirEditorAnuncios() {

    const conteudo =
        document.querySelector(
            ".admin-content"
        );

    const editor =
        document.querySelector(
            "[data-editor-anuncios]"
        );


    if (!editor) {

        console.error(
            "Harmonia Admin: editor de anúncios não encontrado."
        );

        return;
    }


    if (conteudo) {
        conteudo.hidden = true;
    }


    editor.hidden = false;


    await carregarAnunciosAdmin();
}


/* =====================================================
   CARREGAR JSON ATUAL
===================================================== */

async function carregarAnunciosAdmin() {

    try {

        const resposta =
            await fetch(
                `data/anuncios.json?v=${Date.now()}`
            );


        if (!resposta.ok) {

            throw new Error(
                `HTTP ${resposta.status}`
            );
        }


        const dados =
            await resposta.json();


        anunciosAdmin =
            Array.isArray(dados.anuncios)
                ? dados.anuncios.map(
                    anuncio => ({
                        ...anuncio
                    })
                )
                : [];


        renderizarAnunciosAdmin();


        console.log(
            `Harmonia Admin: ${anunciosAdmin.length} anúncio(s) carregado(s).`
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar anúncios:",
            erro
        );


        anunciosAdmin = [];


        renderizarAnunciosAdmin();
    }
}


/* =====================================================
   RENDERIZAR ANÚNCIOS
===================================================== */

function renderizarAnunciosAdmin() {

    const container =
        document.querySelector(
            "[data-admin-anuncios-list]"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (anunciosAdmin.length === 0) {

        const mensagem =
            document.createElement("p");


        mensagem.className =
            "admin-message";


        mensagem.textContent =
            "Nenhum anúncio cadastrado.";


        container.appendChild(
            mensagem
        );


        return;
    }


    anunciosAdmin.forEach(
        (anuncio, indice) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "admin-announcement-card";


            card.innerHTML = `
                <div class="admin-announcement-grid">

                    <div class="admin-form-group full">

                        <label>
                            Título
                        </label>

                        <input
                            type="text"
                            data-anuncio-campo="titulo"
                            data-indice="${indice}"
                            value="${escaparHTML(
                                anuncio.titulo || ""
                            )}"
                            placeholder="Título do anúncio"
                        >

                    </div>


                    <div class="admin-form-group full">

                        <label>
                            Mensagem
                        </label>

                        <textarea
                            data-anuncio-campo="mensagem"
                            data-indice="${indice}"
                            placeholder="Digite o anúncio"
                        >${escaparHTML(
                            anuncio.mensagem || ""
                        )}</textarea>

                    </div>


                    <div class="admin-form-group">

                        <label>
                            Data inicial
                        </label>

                        <input
                            type="date"
                            data-anuncio-campo="inicio"
                            data-indice="${indice}"
                            value="${escaparHTML(
                                anuncio.inicio || ""
                            )}"
                        >

                    </div>


                    <div class="admin-form-group">

                        <label>
                            Data final
                        </label>

                        <input
                            type="date"
                            data-anuncio-campo="fim"
                            data-indice="${indice}"
                            value="${escaparHTML(
                                anuncio.fim || ""
                            )}"
                        >

                    </div>


                    <div class="admin-form-group full">

                        <label>

                            <input
                                type="checkbox"
                                data-anuncio-campo="destaque"
                                data-indice="${indice}"
                                ${
                                    anuncio.destaque
                                        ? "checked"
                                        : ""
                                }
                            >

                            Anúncio em destaque

                        </label>

                    </div>

                </div>


                <div class="admin-announcement-actions">

                    <button
                        type="button"
                        class="admin-remove-button"
                        data-remover-anuncio="${indice}"
                    >
                        Excluir anúncio
                    </button>

                </div>
            `;


            container.appendChild(
                card
            );
        }
    );


    configurarCamposAnuncios();
}


/* =====================================================
   CAMPOS DOS ANÚNCIOS
===================================================== */

function configurarCamposAnuncios() {

    const campos =
        document.querySelectorAll(
            "[data-anuncio-campo]"
        );


    campos.forEach(campo => {

        campo.addEventListener(
            "input",
            atualizarAnuncioAdmin
        );


        campo.addEventListener(
            "change",
            atualizarAnuncioAdmin
        );
    });


    const botoesRemover =
        document.querySelectorAll(
            "[data-remover-anuncio]"
        );


    botoesRemover.forEach(botao => {

        botao.addEventListener(
            "click",
            () => {

                const indice =
                    Number(
                        botao.dataset
                            .removerAnuncio
                    );


                if (
                    !Number.isInteger(indice) ||
                    !anunciosAdmin[indice]
                ) {
                    return;
                }


                const confirmar =
                    window.confirm(
                        "Deseja realmente excluir este anúncio?"
                    );


                if (!confirmar) {
                    return;
                }


                anunciosAdmin.splice(
                    indice,
                    1
                );


                renderizarAnunciosAdmin();
            }
        );
    });
}


/* =====================================================
   ATUALIZAR OBJETO
===================================================== */

function atualizarAnuncioAdmin(
    evento
) {

    const campo =
        evento.target;


    const indice =
        Number(
            campo.dataset.indice
        );


    const propriedade =
        campo.dataset.anuncioCampo;


    if (
        !Number.isInteger(indice) ||
        !anunciosAdmin[indice] ||
        !propriedade
    ) {
        return;
    }


    if (
        campo.type === "checkbox"
    ) {

        anunciosAdmin[indice][
            propriedade
        ] = campo.checked;

    } else {

        anunciosAdmin[indice][
            propriedade
        ] = campo.value;
    }
}


/* =====================================================
   ADICIONAR ANÚNCIO
===================================================== */

function adicionarAnuncioAdmin() {

    const ids =
        anunciosAdmin.map(
            item =>
                Number(item.id) || 0
        );


    const proximoId =
        ids.length === 0
            ? 1
            : Math.max(...ids) + 1;


    anunciosAdmin.push({

        id: proximoId,

        titulo: "",

        mensagem: "",

        inicio: "",

        fim: "",

        destaque: false
    });


    renderizarAnunciosAdmin();


    const cards =
        document.querySelectorAll(
            ".admin-announcement-card"
        );


    const ultimoCard =
        cards[cards.length - 1];


    if (ultimoCard) {

        ultimoCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        const primeiroCampo =
            ultimoCard.querySelector(
                "input[type='text']"
            );


        if (primeiroCampo) {
            primeiroCampo.focus();
        }
    }
}


/* =====================================================
   VALIDAR ANÚNCIOS
===================================================== */

function validarAnuncios() {

    for (
        let indice = 0;
        indice < anunciosAdmin.length;
        indice++
    ) {

        const anuncio =
            anunciosAdmin[indice];


        if (
            !anuncio.titulo.trim()
        ) {

            alert(
                `Informe o título do anúncio ${indice + 1}.`
            );

            return false;
        }


        if (
            !anuncio.mensagem.trim()
        ) {

            alert(
                `Informe a mensagem do anúncio ${indice + 1}.`
            );

            return false;
        }


        if (
            !anuncio.inicio
        ) {

            alert(
                `Informe a data inicial do anúncio ${indice + 1}.`
            );

            return false;
        }


        if (
            !anuncio.fim
        ) {

            alert(
                `Informe a data final do anúncio ${indice + 1}.`
            );

            return false;
        }


        if (
            anuncio.fim <
            anuncio.inicio
        ) {

            alert(
                `A data final do anúncio ${indice + 1} não pode ser anterior à data inicial.`
            );

            return false;
        }
    }


    return true;
}


/* =====================================================
   GERAR JSON
===================================================== */

function gerarJSONAnuncios() {

    if (!validarAnuncios()) {
        return;
    }


    const dados = {

        anuncios:
            anunciosAdmin.map(
                anuncio => ({

                    id:
                        Number(
                            anuncio.id
                        ),

                    titulo:
                        anuncio.titulo.trim(),

                    mensagem:
                        anuncio.mensagem.trim(),

                    inicio:
                        anuncio.inicio,

                    fim:
                        anuncio.fim,

                    destaque:
                        Boolean(
                            anuncio.destaque
                        )
                })
            )
    };


    const json =
        JSON.stringify(
            dados,
            null,
            2
        );


    const resultado =
        document.querySelector(
            "[data-json-result]"
        );


    const output =
        document.querySelector(
            "[data-json-output]"
        );


    if (
        !resultado ||
        !output
    ) {
        return;
    }


    output.value = json;

    resultado.hidden = false;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =====================================================
   COPIAR JSON
===================================================== */

async function copiarJSONAnuncios() {

    const output =
        document.querySelector(
            "[data-json-output]"
        );


    if (
        !output ||
        !output.value
    ) {
        return;
    }


    try {

        await navigator.clipboard
            .writeText(
                output.value
            );


        alert(
            "JSON copiado."
        );

    } catch (erro) {

        console.error(
            "Erro ao copiar JSON:",
            erro
        );


        output.select();


        alert(
            "Não foi possível copiar automaticamente. O conteúdo foi selecionado."
        );
    }
}


/* =====================================================
   BAIXAR JSON
===================================================== */

function baixarJSONAnuncios() {

    const output =
        document.querySelector(
            "[data-json-output]"
        );


    if (
        !output ||
        !output.value
    ) {

        alert(
            "Primeiro clique em Gerar JSON."
        );

        return;
    }


    const blob =
        new Blob(
            [output.value],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "anuncios.json";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () => {
            URL.revokeObjectURL(
                url
            );
        },
        100
    );
}


/* =====================================================
   VOLTAR AO MENU
===================================================== */

function voltarMenuAdmin() {

    const conteudo =
        document.querySelector(
            ".admin-content"
        );

    const editor =
        document.querySelector(
            "[data-editor-anuncios]"
        );

    const resultado =
        document.querySelector(
            "[data-json-result]"
        );


    if (editor) {
        editor.hidden = true;
    }


    if (resultado) {
        resultado.hidden = true;
    }


    if (conteudo) {
        conteudo.hidden = false;
    }
}


/* =====================================================
   FECHAR EDITORES
===================================================== */

function fecharEditores() {

    const editor =
        document.querySelector(
            "[data-editor-anuncios]"
        );

    const conteudo =
        document.querySelector(
            ".admin-content"
        );


    if (editor) {
        editor.hidden = true;
    }


    if (conteudo) {
        conteudo.hidden = false;
    }
}


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escaparHTML(valor) {

    return String(valor)

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
   EVENTOS DO EDITOR
===================================================== */

function configurarEditorAnuncios() {

    const adicionar =
        document.querySelector(
            "[data-adicionar-anuncio]"
        );


    if (adicionar) {

        adicionar.addEventListener(
            "click",
            adicionarAnuncioAdmin
        );
    }


    const gerar =
        document.querySelector(
            "[data-gerar-anuncios-json]"
        );


    if (gerar) {

        gerar.addEventListener(
            "click",
            gerarJSONAnuncios
        );
    }


    const copiar =
        document.querySelector(
            "[data-copiar-json]"
        );


    if (copiar) {

        copiar.addEventListener(
            "click",
            copiarJSONAnuncios
        );
    }


    const baixar =
        document.querySelector(
            "[data-baixar-json]"
        );


    if (baixar) {

        baixar.addEventListener(
            "click",
            baixarJSONAnuncios
        );
    }


    const voltar =
        document.querySelector(
            "[data-voltar-menu]"
        );


    if (voltar) {

        voltar.addEventListener(
            "click",
            voltarMenuAdmin
        );
    }
}
/* =====================================================
   ADMIN - TERRITÓRIOS
===================================================== */

let territoriosAdmin = [];

let configuracaoTerritoriosAdmin = {
    diasUsoProlongado: 30,
    diasSemUsoAlerta: 90
};


/* =====================================================
   ABRIR EDITOR
===================================================== */

async function abrirEditorTerritorios() {

    const conteudo =
        document.querySelector(
            ".admin-content"
        );

    const editorAnuncios =
        document.querySelector(
            "[data-editor-anuncios]"
        );

    const editorTerritorios =
        document.querySelector(
            "[data-editor-territorios]"
        );


    if (!editorTerritorios) {

        console.error(
            "Harmonia Admin: editor de territórios não encontrado."
        );

        return;
    }


    if (conteudo) {
        conteudo.hidden = true;
    }


    if (editorAnuncios) {
        editorAnuncios.hidden = true;
    }


    editorTerritorios.hidden = false;


    await carregarTerritoriosAdmin();
}


/* =====================================================
   CARREGAR JSON
===================================================== */

async function carregarTerritoriosAdmin() {

    try {

        const resposta =
            await fetch(
                `data/territorios.json?v=${Date.now()}`
            );


        if (!resposta.ok) {
            throw new Error(
                `HTTP ${resposta.status}`
            );
        }


        const dados =
            await resposta.json();


        configuracaoTerritoriosAdmin = {
            ...configuracaoTerritoriosAdmin,
            ...(dados.configuracao || {})
        };


        territoriosAdmin =
            Array.isArray(dados.territorios)
                ? dados.territorios.map(
                    territorio => ({
                        ...territorio,
                        historico:
                            Array.isArray(
                                territorio.historico
                            )
                                ? territorio.historico.map(
                                    item => ({
                                        ...item
                                    })
                                )
                                : []
                    })
                )
                : [];


        atualizarResumoTerritoriosAdmin();

        renderizarTerritoriosAdmin();


        console.log(
            `Harmonia Admin: ${territoriosAdmin.length} território(s) carregado(s).`
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar territórios:",
            erro
        );


        territoriosAdmin = [];

        atualizarResumoTerritoriosAdmin();

        renderizarTerritoriosAdmin();
    }
}


/* =====================================================
   RESUMO
===================================================== */

function atualizarResumoTerritoriosAdmin() {

    const total =
        territoriosAdmin.length;


    const disponiveis =
        territoriosAdmin.filter(
            territorio =>
                territorio.status === "disponivel"
        ).length;


    const emUso =
        territoriosAdmin.filter(
            territorio =>
                territorio.status === "em-uso"
        ).length;


    const atencao =
        territoriosAdmin.filter(
            territorio =>
                territorioEmAtencaoAdmin(
                    territorio
                )
        ).length;


    preencherResumoTerritoriosAdmin(
        "total",
        total
    );

    preencherResumoTerritoriosAdmin(
        "disponiveis",
        disponiveis
    );

    preencherResumoTerritoriosAdmin(
        "emUso",
        emUso
    );

    preencherResumoTerritoriosAdmin(
        "atencao",
        atencao
    );
}


function preencherResumoTerritoriosAdmin(
    campo,
    valor
) {

    const elemento =
        document.querySelector(
            `[data-admin-territory-summary="${campo}"]`
        );


    if (elemento) {
        elemento.textContent =
            valor;
    }
}


/* =====================================================
   RENDERIZAR LISTA
===================================================== */

function renderizarTerritoriosAdmin() {

    const container =
        document.querySelector(
            "[data-admin-territory-list]"
        );


    if (!container) {
        return;
    }


    const pesquisa =
        obterPesquisaTerritoriosAdmin();


    const lista =
        territoriosAdmin.filter(
            territorio =>
                correspondePesquisaTerritoriosAdmin(
                    territorio,
                    pesquisa
                )
        );


    container.innerHTML = "";


    if (lista.length === 0) {

        const vazio =
            document.createElement("div");


        vazio.className =
            "admin-territory-empty";


        vazio.textContent =
            "Nenhum território encontrado.";


        container.appendChild(
            vazio
        );


        return;
    }


    lista.forEach(
        territorio => {

            const card =
                criarCardTerritorioAdmin(
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

function criarCardTerritorioAdmin(
    territorio
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-territory-card";


    const emUso =
        territorio.status === "em-uso";


    const statusClasse =
        emUso
            ? "in-use"
            : "available";


    const statusTexto =
        emUso
            ? "Em uso"
            : "Disponível";


    const diasEmUso =
        calcularDiasTerritorioAdmin(
            territorio.dataEntrega
        );


    const ultimaUtilizacao =
        territorio.ultimaUtilizacao
            ? formatarDataAdmin(
                territorio.ultimaUtilizacao
            )
            : "Nunca utilizado";


    card.innerHTML = `
        <div class="admin-territory-card-header">

            <div class="admin-territory-card-title">

                <span>
                    Território ${escaparHTML(
                        territorio.numero || territorio.id
                    )}
                </span>

                <strong>
                    ${escaparHTML(
                        territorio.nome || "Território"
                    )}
                </strong>

                <p>
                    ${escaparHTML(
                        territorio.regiao || "Região não definida"
                    )}
                </p>

            </div>


            <span
                class="admin-territory-status ${statusClasse}"
            >
                ${statusTexto}
            </span>

        </div>


        <div class="admin-territory-card-info">

            <div class="admin-territory-info">

                <span>
                    ${
                        emUso
                            ? "Dirigente"
                            : "Última utilização"
                    }
                </span>

                <strong>
                    ${
                        emUso
                            ? escaparHTML(
                                territorio.dirigenteAtual || "A definir"
                            )
                            : ultimaUtilizacao
                    }
                </strong>

            </div>


            <div class="admin-territory-info">

                <span>
                    ${
                        emUso
                            ? "Em uso há"
                            : "Histórico"
                    }
                </span>

                <strong>
                    ${
                        emUso
                            ? formatarDiasAdmin(
                                diasEmUso
                            )
                            : `${
                                Array.isArray(
                                    territorio.historico
                                )
                                    ? territorio.historico.length
                                    : 0
                            } movimentação(ões)`
                    }
                </strong>

            </div>

        </div>


        <div class="admin-territory-card-actions">

            <button
                type="button"
                class="admin-territory-button"
                data-admin-territory-history="${territorio.id}"
            >
                Histórico
            </button>


            ${
                emUso
                    ? `
                        <button
                            type="button"
                            class="admin-territory-button primary"
                            data-admin-territory-return="${territorio.id}"
                        >
                            Devolver
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="admin-territory-button primary"
                            data-admin-territory-deliver="${territorio.id}"
                        >
                            Entregar
                        </button>
                    `
            }

        </div>
    `;


    configurarAcoesTerritorioAdmin(
        card,
        territorio
    );


    return card;
}


/* =====================================================
   AÇÕES
===================================================== */

function configurarAcoesTerritorioAdmin(
    card,
    territorio
) {

    const entregar =
        card.querySelector(
            "[data-admin-territory-deliver]"
        );


    if (entregar) {

        entregar.addEventListener(
            "click",
            () => {

                const dirigente =
                    prompt(
                        `Dirigente para o Território ${territorio.numero}:`
                    );


                if (!dirigente) {
                    return;
                }


                const data =
                    prompt(
                        "Data da entrega (AAAA-MM-DD):",
                        obterDataHojeAdmin()
                    );


                if (!data) {
                    return;
                }


                territorio.status =
                    "em-uso";


                territorio.dirigenteAtual =
                    dirigente.trim();


                territorio.dataEntrega =
                    data;


                territorio.dataDevolucao =
                    null;


                territorio.ultimaUtilizacao =
                    data;


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
                    dirigente:
                        dirigente.trim(),
                    observacaoEntrega: "",
                    observacaoDevolucao: ""
                });


                atualizarResumoTerritoriosAdmin();

                renderizarTerritoriosAdmin();
            }
        );
    }


    const devolver =
        card.querySelector(
            "[data-admin-territory-return]"
        );


    if (devolver) {

        devolver.addEventListener(
            "click",
            () => {

                const data =
                    prompt(
                        "Data da devolução (AAAA-MM-DD):",
                        obterDataHojeAdmin()
                    );


                if (!data) {
                    return;
                }


                if (
                    territorio.dataEntrega &&
                    data <
                        territorio.dataEntrega
                ) {

                    alert(
                        "A data da devolução não pode ser anterior à data da entrega."
                    );

                    return;
                }


                const movimentoAberto =
                    [...territorio.historico]
                        .reverse()
                        .find(
                            item =>
                                !item.devolvidoEm
                        );


                if (movimentoAberto) {

                    movimentoAberto
                        .devolvidoEm =
                            data;
                }


                territorio.status =
                    "disponivel";


                territorio.dataDevolucao =
                    data;


                territorio.ultimaUtilizacao =
                    data;


                territorio.dirigenteAtual =
                    null;


                territorio.dataEntrega =
                    null;


                atualizarResumoTerritoriosAdmin();

                renderizarTerritoriosAdmin();
            }
        );
    }


    const historico =
        card.querySelector(
            "[data-admin-territory-history]"
        );


    if (historico) {

        historico.addEventListener(
            "click",
            () => {

                mostrarHistoricoTerritorioAdmin(
                    territorio
                );
            }
        );
    }
}


/* =====================================================
   HISTÓRICO
===================================================== */

function mostrarHistoricoTerritorioAdmin(
    territorio
) {

    const historico =
        Array.isArray(
            territorio.historico
        )
            ? territorio.historico
            : [];


    if (historico.length === 0) {

        alert(
            `Território ${territorio.numero}\n\nNenhuma movimentação registrada.`
        );

        return;
    }


    const linhas = [
        `Território ${territorio.numero}`,
        "",
        "HISTÓRICO",
        ""
    ];


    historico
        .slice()
        .reverse()
        .forEach(
            movimento => {

                linhas.push(
                    `${
                        formatarDataAdmin(
                            movimento.entregueEm
                        )
                    } → ${
                        movimento.devolvidoEm
                            ? formatarDataAdmin(
                                movimento.devolvidoEm
                            )
                            : "Em uso"
                    }`
                );


                linhas.push(
                    `Dirigente: ${
                        movimento.dirigente || "—"
                    }`
                );


                linhas.push("");
            }
        );


    alert(
        linhas.join("\n")
    );
}


/* =====================================================
   PESQUISA
===================================================== */

function obterPesquisaTerritoriosAdmin() {

    const campo =
        document.querySelector(
            "[data-admin-territory-search]"
        );


    return normalizarTextoAdmin(
        campo?.value || ""
    );
}


function correspondePesquisaTerritoriosAdmin(
    territorio,
    pesquisa
) {

    if (!pesquisa) {
        return true;
    }


    const texto =
        normalizarTextoAdmin(
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
   GERAR JSON
===================================================== */

function gerarTerritoriosJSONAdmin() {

    const dados = {

        configuracao:
            configuracaoTerritoriosAdmin,

        territorios:
            territoriosAdmin
    };


    const json =
        JSON.stringify(
            dados,
            null,
            2
        );


    const resultado =
        document.querySelector(
            "[data-admin-territories-json-result]"
        );


    const output =
        document.querySelector(
            "[data-admin-territories-json-output]"
        );


    if (
        !resultado ||
        !output
    ) {
        return;
    }


    output.value =
        json;


    resultado.hidden =
        false;
}


/* =====================================================
   COPIAR JSON
===================================================== */

async function copiarTerritoriosJSONAdmin() {

    const output =
        document.querySelector(
            "[data-admin-territories-json-output]"
        );


    if (
        !output ||
        !output.value
    ) {
        return;
    }


    try {

        await navigator.clipboard
            .writeText(
                output.value
            );


        alert(
            "JSON copiado."
        );

    } catch (erro) {

        console.error(
            erro
        );


        output.select();
    }
}


/* =====================================================
   BAIXAR JSON
===================================================== */

function baixarTerritoriosJSONAdmin() {

    const output =
        document.querySelector(
            "[data-admin-territories-json-output]"
        );


    if (
        !output ||
        !output.value
    ) {

        alert(
            "Primeiro clique em Gerar JSON."
        );

        return;
    }


    const blob =
        new Blob(
            [output.value],
            {
                type:
                    "application/json;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "territorios.json";


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        100
    );
}


/* =====================================================
   VOLTAR AO MENU
===================================================== */

function voltarTerritoriosAdmin() {

    const editor =
        document.querySelector(
            "[data-editor-territorios]"
        );


    const conteudo =
        document.querySelector(
            ".admin-content"
        );


    const resultado =
        document.querySelector(
            "[data-admin-territories-json-result]"
        );


    if (editor) {
        editor.hidden = true;
    }


    if (resultado) {
        resultado.hidden = true;
    }


    if (conteudo) {
        conteudo.hidden = false;
    }
}


/* =====================================================
   UTILIDADES
===================================================== */

function territorioEmAtencaoAdmin(
    territorio
) {

    if (
        territorio.status ===
        "em-uso"
    ) {

        const dias =
            calcularDiasTerritorioAdmin(
                territorio.dataEntrega
            );


        return (
            dias !== null &&
            dias >=
                configuracaoTerritoriosAdmin
                    .diasUsoProlongado
        );
    }


    if (
        territorio.ultimaUtilizacao
    ) {

        const dias =
            calcularDiasTerritorioAdmin(
                territorio.ultimaUtilizacao
            );


        return (
            dias !== null &&
            dias >=
                configuracaoTerritoriosAdmin
                    .diasSemUsoAlerta
        );
    }


    return false;
}


function calcularDiasTerritorioAdmin(
    data
) {

    if (!data) {
        return null;
    }


    const inicio =
        criarDataAdmin(
            data
        );


    const fim =
        criarDataAdmin(
            obterDataHojeAdmin()
        );


    if (
        !inicio ||
        !fim
    ) {
        return null;
    }


    return Math.max(
        0,
        Math.floor(
            (
                fim.getTime() -
                inicio.getTime()
            ) /
            86400000
        )
    );
}


function criarDataAdmin(
    valor
) {

    const partes =
        String(valor)
            .split("-")
            .map(Number);


    if (
        partes.length !== 3
    ) {
        return null;
    }


    return new Date(
        partes[0],
        partes[1] - 1,
        partes[2]
    );
}


function obterDataHojeAdmin() {

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


function formatarDataAdmin(
    valor
) {

    if (!valor) {
        return "—";
    }


    const partes =
        valor.split("-");


    return partes.length === 3
        ? `${partes[2]}/${partes[1]}/${partes[0]}`
        : valor;
}


function formatarDiasAdmin(
    dias
) {

    if (dias === null) {
        return "—";
    }


    if (dias === 0) {
        return "Hoje";
    }


    if (dias === 1) {
        return "1 dia";
    }


    return `${dias} dias`;
}


function normalizarTextoAdmin(
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


/* =====================================================
   EVENTOS DO EDITOR DE TERRITÓRIOS
===================================================== */

function configurarEditorTerritorios() {

    const pesquisa =
        document.querySelector(
            "[data-admin-territory-search]"
        );


    if (pesquisa) {

        pesquisa.addEventListener(
            "input",
            renderizarTerritoriosAdmin
        );
    }


    const voltar =
        document.querySelector(
            "[data-voltar-territorios]"
        );


    if (voltar) {

        voltar.addEventListener(
            "click",
            voltarTerritoriosAdmin
        );
    }


    const gerar =
        document.querySelector(
            "[data-admin-generate-territories-json]"
        );


    if (gerar) {

        gerar.addEventListener(
            "click",
            gerarTerritoriosJSONAdmin
        );
    }


    const copiar =
        document.querySelector(
            "[data-admin-copy-territories-json]"
        );


    if (copiar) {

        copiar.addEventListener(
            "click",
            copiarTerritoriosJSONAdmin
        );
    }


    const baixar =
        document.querySelector(
            "[data-admin-download-territories-json]"
        );


    if (baixar) {

        baixar.addEventListener(
            "click",
            baixarTerritoriosJSONAdmin
        );
    }
}