# Execução nativa das Linguagens e animação por gravação de Ações

JavaScript roda nativamente no navegador, Python roda via Pyodide (WASM) e o Portugol é compilado por um compilador próprio para JavaScript. Todos rodam em Web Workers, e o jogo grava as Ações que o programa executa e anima essa gravação no mapa, em vez de usar um interpretador único com execução passo a passo. Escolhemos isso para o jogador aprender as Linguagens reais, e não subconjuntos de brinquedo, e para poder interromper loops infinitos.

## Considered Options

- **Motor próprio com representação interna comum**: daria execução passo a passo e destaque de linha em todas as Linguagens, mas JavaScript e Python seriam subconjuntos simplificados, e cada nova Linguagem exigiria um parser completo.

## Consequences

- Não há destaque da linha em execução na v1. Só o Portugol, por ter compilador próprio, poderia oferecê-lo depois.
- Todas as Linguagens precisam expor o mesmo vocabulário de Ações e Sensores, para que o mesmo Desafio funcione em qualquer uma.
- Cada nova Linguagem real entra como um novo runtime, com custo de carregamento (o Pyodide é pesado).
