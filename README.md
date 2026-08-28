# Harmonia

Aplicação web para organização e consulta das informações da
**Congregação Harmonia**.

O projeto foi desenvolvido com foco em simplicidade, facilidade de
atualização, boa experiência em dispositivos móveis e acesso rápido às
informações da congregação.

------------------------------------------------------------------------

## 🌐 Acesso

A versão publicada está disponível através do GitHub Pages:

**Harmonia --- Congregação Harmonia**

https://rogerrta.github.io/Harmonia/

------------------------------------------------------------------------

## 🎯 Objetivo

O Harmonia foi criado para centralizar informações úteis da congregação
em um único local, permitindo acesso rápido tanto pelo computador quanto
pelo celular.

O objetivo principal é manter a programação e outras informações sempre
atualizadas, de forma simples e sem necessidade de servidor, banco de
dados ou sistemas complexos.

------------------------------------------------------------------------

## ✨ Recursos atuais

### 📖 Reunião do meio de semana

Permite consultar a programação das semanas do mês, incluindo as
designações correspondentes.

-   `designacaoSemana01.html`
-   `designacaoSemana02.html`
-   `designacaoSemana03.html`
-   `designacaoSemana04.html`
-   `designacaoSemana05.html`

Dados: `data/meio-semana.json`

### 📅 Reunião do final de semana

Página: `finalsemana.html`

Dados: `data/final-semana.json`

### 🚶 Arranjo de serviço de campo

Área dedicada aos arranjos de serviço de campo.

Arquivos principais: `arranjo-campo.html`, `arranjo-campo.css`,
`arranjo-campo.js` e `arranjo-campo-pagina.js`.

Dados: `data/arranjo-campo.json`

### 📢 Anúncios

A página inicial pode exibir anúncios importantes da congregação.

Dados: `data/anuncios.json`

### 🗺️ Controle de territórios

O projeto possui um módulo para acompanhamento dos territórios, com
cadastro, disponibilidade, entrega, devolução, dirigente responsável,
histórico de movimentações, última utilização, indicadores de atenção,
pesquisa e geração do JSON atualizado.

Dados: `data/territorios.json`

------------------------------------------------------------------------

## 🔐 Painel administrativo

O Harmonia possui uma área administrativa para facilitar tarefas de
manutenção.

Arquivos principais:

-   `admin.html`
-   `admin.css`
-   `admin.js`

Atualmente o painel permite trabalhar com anúncios e controle de
territórios, incluindo cadastro, entrega, devolução, histórico e geração
dos dados atualizados em JSON.

> O painel administrativo funciona totalmente no navegador. Como o
> projeto utiliza GitHub Pages e não possui backend, ele não deve ser
> considerado um sistema de autenticação de alta segurança.

------------------------------------------------------------------------

## 🗂️ Dados em JSON

As informações dinâmicas ficam organizadas na pasta `data/`:

``` text
data/
├── anuncios.json
├── arranjo-campo.json
├── final-semana.json
├── meio-semana.json
└── territorios.json
```

Essa organização facilita a manutenção sem exigir alterações em toda a
estrutura HTML.

------------------------------------------------------------------------

## 📱 Interface

A interface segue princípios de design simples e limpo, navegação
intuitiva, boa legibilidade, layout responsivo, prioridade para
dispositivos móveis e baixa complexidade de manutenção.

O objetivo é manter uma ferramenta prática, estável e fácil de usar.

------------------------------------------------------------------------

## 🛠️ Tecnologias

-   HTML5
-   CSS3
-   JavaScript
-   JSON
-   Git
-   GitHub
-   GitHub Pages

Não é necessário servidor de aplicação nem banco de dados para executar
a versão atual.

------------------------------------------------------------------------

## 📂 Estrutura do projeto

``` text
Harmonia/
├── index.html
├── style.css
├── app.js
├── designacaoSemana01.html
├── designacaoSemana02.html
├── designacaoSemana03.html
├── designacaoSemana04.html
├── designacaoSemana05.html
├── finalsemana.html
├── arranjo-campo.html
├── arranjo-campo.css
├── arranjo-campo.js
├── arranjo-campo-pagina.js
├── anuncios.js
├── admin.html
├── admin.css
├── admin.js
├── territorios.html
├── territorios.css
├── territorios.js
├── data/
│   ├── anuncios.json
│   ├── arranjo-campo.json
│   ├── final-semana.json
│   ├── meio-semana.json
│   └── territorios.json
├── publicar.sh
└── README.md
```

------------------------------------------------------------------------

## 🔄 Atualização

O fluxo de manutenção normalmente consiste em atualizar os arquivos
necessários, conferir os JSON, testar localmente, registrar as
alterações com Git e enviá-las ao GitHub.

O projeto também possui o script `publicar.sh` para auxiliar no processo
de validação e publicação.

------------------------------------------------------------------------

## 🌍 Hospedagem

O site é hospedado através do **GitHub Pages** e a versão publicada
utiliza a branch `main`.

Após o envio das alterações para essa branch, o GitHub Pages atualiza a
versão pública do site.

------------------------------------------------------------------------

## 📌 Estado atual do projeto

O Harmonia encontra-se em uma versão **estável e funcional**.

Os principais recursos planejados para esta etapa estão implementados. A
prioridade atual é manter o sistema estável, fácil de atualizar,
acessível, leve, confiável e simples de manter.

Novas funcionalidades poderão ser adicionadas futuramente caso surja uma
necessidade real.

------------------------------------------------------------------------

## 📝 Observação

O Harmonia é um projeto desenvolvido para uso organizacional local.

Sua estrutura pode continuar evoluindo conforme novas necessidades
surgirem, mantendo como prioridade a simplicidade e a facilidade de
utilização.