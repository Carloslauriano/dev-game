# Dev Game

Jogo web para aprender lógica de programação em português. Roda 100% no navegador, sem servidor e sem conta.

O jogador (o **Iniciante**) escolhe uma Linguagem, comanda um personagem em um mapa e resolve Desafios. Nos primeiros Conceitos monta a solução com Blocos visuais que mostram o código equivalente. No Conceito de variáveis passa a escrever código em texto. O jogo roda o programa, grava as Ações e anima a gravação no mapa.

A Dificuldade da v1 é **Here Comes a New Challenger**. As outras aparecem como "em breve".

## Como jogar

- **Linguagens:** JavaScript, Python e Portugol (dialeto Portugol Studio, em um subconjunto). C e outras estão marcadas como "em breve".
- **Ações:** andar, virar à esquerda, virar à direita e pegar.
- **Sensores:** caminho livre, tem item e na meta.
- **Conceitos:** sequência, repetição com contagem, condição, repetição com condição e variáveis, com 5 Desafios cada (25 no total). O Conceito seguinte abre quando 3 de 5 Desafios do anterior estão resolvidos.
- **Estrelas:** até 3 por Desafio (resolver, poucas instruções, sem Dica). Pedir uma Dica custa uma Estrela. Refazer um Desafio nunca remove Estrelas já ganhas.
- **Progresso:** salvo no `localStorage`, só neste navegador. Limpar os dados do navegador apaga o progresso.

Nomes das Ações e dos Sensores:

| | JavaScript e Python | Portugol |
|---|---|---|
| Ações | `move()`, `turnLeft()`, `turnRight()`, `pickUp()` | `andar()`, `virarEsquerda()`, `virarDireita()`, `pegar()` |
| Sensores | `pathClear()`, `hasItem()`, `atGoal()` | `caminhoLivre()`, `temItem()`, `naMeta()` |

## Desenvolvimento

Requer Node.js e npm.

```sh
npm install
npm run dev     # servidor de desenvolvimento
npm test        # testes (Vitest)
npm run build   # checa tipos e gera o site estático em dist/
```

O resultado de `npm run build` é um site estático e pode ser hospedado em qualquer lugar.

## Como funciona

A decisão está em [`docs/adr/0001-execucao-nativa-e-gravacao-de-acoes.md`](docs/adr/0001-execucao-nativa-e-gravacao-de-acoes.md).

- JavaScript roda nativamente no navegador, Python roda via Pyodide (WebAssembly) e o Portugol é compilado para JavaScript por um compilador próprio.
- Todo código do jogador roda em Web Workers, que o isolam e permitem interrompê-lo.
- O programa roda inteiro, o jogo grava as Ações e anima a gravação. Não há execução passo a passo.
- Um limite de Ações (1000) e um tempo máximo interrompem loops infinitos com uma mensagem amigável.
- O Pyodide é pesado e só carrega quando o jogador escolhe Python.

O ponto de teste central é `runChallenge` (`src/engine/runChallenge.ts`): entram um Desafio, uma Linguagem e o código, e saem a gravação de Ações, o resultado e as Estrelas.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/engine/` | execução dos Desafios, Workers, compilador de Portugol, Estrelas e regras de desbloqueio |
| `src/challenges/` | Desafios como dados (mapa, meta, itens, obstáculos), dicas e soluções de referência |
| `src/blocks/` | Blocos visuais (Blockly) e geradores de código para as três Linguagens |
| `src/ui/` | telas, animação, tema de arcade e progresso no `localStorage` |
| `src/i18n/` | textos da interface em pt-BR |

Novos Desafios são dados em `src/challenges/` e não exigem mudança de código no motor. Uma nova Linguagem entra como um novo runtime em `src/engine/`.

## Documentação

- [`GLOSSARY.md`](GLOSSARY.md): vocabulário do projeto (Iniciante, Dificuldade, Desafio, Linguagem, Ação, Sensor, Conceito, Estrela, Dica).
- [`docs/adr/`](docs/adr/): decisões de arquitetura.
- Issues e specs ficam no GitHub Issues. A spec da v1 é a issue #1.
