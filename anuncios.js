"use strict";

document.addEventListener(
    "DOMContentLoaded",
    carregarAnuncios
);

async function carregarAnuncios() {

    const secao =
        document.querySelector("[data-anuncios]");

    if (!secao) {
        return;
    }

    try {

        const resposta = await fetch(
            `data/anuncios.json?v=${Date.now()}`
        );

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();

        if (!Array.isArray(dados.anuncios)) {
            esconderSecao(secao);
            return;
        }

        const hoje = obterDataLocal();

        const anunciosAtivos =
            dados.anuncios.filter(anuncio => {

                if (!anuncio.inicio || !anuncio.fim) {
                    return false;
                }

                return (
                    hoje >= anuncio.inicio &&
                    hoje <= anuncio.fim
                );
            });


        if (anunciosAtivos.length === 0) {
            esconderSecao(secao);
            return;
        }


        const container =
            secao.querySelector("[data-lista-anuncios]");

        if (!container) {
            return;
        }

        container.innerHTML = "";


        anunciosAtivos.forEach(anuncio => {

            const card =
                document.createElement("article");

            card.className = "announcement-card";

            if (anuncio.destaque === true) {
                card.classList.add("highlight");
            }

            const titulo =
                document.createElement("h3");

            titulo.textContent =
                anuncio.titulo || "Anúncio";


            const mensagem =
                document.createElement("p");

            mensagem.textContent =
                anuncio.mensagem || "";


            card.appendChild(titulo);
            card.appendChild(mensagem);

            container.appendChild(card);
        });


        secao.hidden = false;

        console.log(
            `Harmonia: ${anunciosAtivos.length} anúncio(s) ativo(s).`
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar anúncios:",
            erro
        );

        esconderSecao(secao);
    }
}


function obterDataLocal() {

    const agora = new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(agora.getMonth() + 1)
            .padStart(2, "0");

    const dia =
        String(agora.getDate())
            .padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function esconderSecao(secao) {
    secao.hidden = true;
}