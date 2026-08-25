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