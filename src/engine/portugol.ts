/**
 * Compilador de Portugol (dialeto Portugol Studio, subconjunto) para JavaScript.
 * O JavaScript gerado chama as mesmas Ações e Sensores do `execute`, então a simulação é única.
 *
 * Subconjunto: sequência, `para`, `enquanto`, `se`/`senao`, variáveis (inteiro, real, logico, cadeia),
 * operadores aritméticos, comparação, `e`, `ou`, `nao`, e o envelope opcional
 * `programa { funcao inicio() { ... } }`.
 */

export class PortugolError extends Error {
  constructor(public line: number, detail: string) {
    super(`linha ${line}: ${detail}`)
  }
}

/** Nomes em português -> nomes usados pelo `execute`. */
export const PORTUGOL_NAMES: Record<string, string> = {
  andar: 'move',
  virarEsquerda: 'turnLeft',
  virarDireita: 'turnRight',
  pegar: 'pickUp',
  caminhoLivre: 'pathClear',
  temItem: 'hasItem',
  naMeta: 'atGoal',
}

const TYPES = new Set(['inteiro', 'real', 'logico', 'cadeia', 'caracter'])
const KEYWORDS = new Set([
  ...TYPES, 'se', 'senao', 'para', 'enquanto', 'e', 'ou', 'nao', 'verdadeiro', 'falso',
  'programa', 'funcao', 'inicio',
])

type Token = { kind: 'num' | 'str' | 'id' | 'op' | 'eof'; text: string; line: number }

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let line = 1
  let i = 0
  const OPS = ['==', '!=', '<=', '>=', '++', '--', '+=', '-=', '*=', '/=', '&&', '||']
  while (i < src.length) {
    const c = src[i]
    if (c === '\n') { line++; i++; continue }
    if (/\s/.test(c)) { i++; continue }
    if (src.startsWith('//', i)) { while (i < src.length && src[i] !== '\n') i++; continue }
    if (src.startsWith('/*', i)) {
      const start = line
      const end = src.indexOf('*/', i + 2)
      if (end < 0) throw new PortugolError(start, 'comentário "/*" não foi fechado com "*/"')
      for (const ch of src.slice(i, end)) if (ch === '\n') line++
      i = end + 2
      continue
    }
    if (/[0-9]/.test(c)) {
      const m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i))!
      tokens.push({ kind: 'num', text: m[0], line }); i += m[0].length; continue
    }
    if (/[A-Za-z_]/.test(c)) {
      const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i))!
      tokens.push({ kind: 'id', text: m[0], line }); i += m[0].length; continue
    }
    if (c === '"' || c === "'") {
      const end = src.indexOf(c, i + 1)
      const nl = src.indexOf('\n', i)
      if (end < 0 || (nl >= 0 && nl < end)) throw new PortugolError(line, 'texto entre aspas não foi fechado')
      tokens.push({ kind: 'str', text: JSON.stringify(src.slice(i + 1, end)), line }); i = end + 1; continue
    }
    const two = OPS.find((o) => src.startsWith(o, i))
    if (two) { tokens.push({ kind: 'op', text: two, line }); i += 2; continue }
    if ('+-*/%<>=!(){};,'.includes(c)) { tokens.push({ kind: 'op', text: c, line }); i++; continue }
    throw new PortugolError(line, `caractere "${c}" não é permitido`)
  }
  tokens.push({ kind: 'eof', text: '', line })
  return tokens
}

class Parser {
  private pos = 0
  private scopes: Set<string>[] = [new Set()]
  constructor(private tokens: Token[]) {}

  private get tok() { return this.tokens[this.pos] }
  private is(text: string) { return this.tok.kind !== 'str' && this.tok.text === text && this.tok.kind !== 'eof' }
  private describe(t: Token) { return t.kind === 'eof' ? 'o fim do código' : `"${t.text}"` }

  private fail(detail: string): never {
    throw new PortugolError(this.tok.line, detail)
  }

  private expect(text: string, contexto: string): Token {
    if (!this.is(text)) {
      if (text === '}' && this.tok.kind === 'eof') {
        this.fail(`faltou fechar a chave "}" ${contexto}`)
      }
      this.fail(`esperava "${text}" ${contexto}, mas encontrei ${this.describe(this.tok)}`)
    }
    return this.tokens[this.pos++]
  }

  private declared(name: string) { return this.scopes.some((s) => s.has(name)) }

  parseProgram(): string {
    let out: string
    if (this.is('programa')) {
      this.pos++
      this.expect('{', 'depois de "programa"')
      this.expect('funcao', 'dentro de "programa"')
      this.expect('inicio', 'depois de "funcao"')
      this.expect('(', 'depois de "inicio"')
      this.expect(')', 'depois de "inicio("')
      this.expect('{', 'para abrir a função "inicio"')
      out = this.statements('}')
      this.expect('}', 'para fechar a função "inicio"')
      this.expect('}', 'para fechar o "programa"')
    } else {
      out = this.statements(null)
    }
    if (this.tok.kind !== 'eof') this.fail(`não esperava ${this.describe(this.tok)} aqui`)
    return out
  }

  private statements(end: string | null): string {
    const out: string[] = []
    while (this.tok.kind !== 'eof' && !(end && this.is(end))) {
      if (this.is('}')) this.fail('chave "}" sobrando, sem "{" correspondente')
      out.push(this.statement())
    }
    return out.join('\n')
  }

  private block(contexto: string): string {
    this.expect('{', contexto)
    this.scopes.push(new Set())
    const body = this.statements('}')
    this.expect('}', `do bloco aberto ${contexto}`)
    this.scopes.pop()
    return `{\n${body}\n}`
  }

  private statement(): string {
    const t = this.tok
    if (t.kind === 'op' && t.text === ';') { this.pos++; return '' }
    if (t.kind === 'id') {
      if (TYPES.has(t.text)) return this.declaration() + this.endStatement()
      if (t.text === 'se') return this.ifStatement()
      if (t.text === 'enquanto') {
        this.pos++
        this.expect('(', 'depois de "enquanto"')
        const cond = this.expression()
        this.expect(')', 'para fechar a condição do "enquanto"')
        return `while (${cond}) ${this.block('depois da condição do "enquanto"')}`
      }
      if (t.text === 'para') return this.forStatement()
      if (t.text === 'senao') this.fail('"senao" sem um "se" antes dele')
      if (KEYWORDS.has(t.text)) this.fail(`não esperava a palavra "${t.text}" aqui`)
      return this.simple() + this.endStatement()
    }
    this.fail(`não esperava ${this.describe(t)} no começo de um comando`)
  }

  /** Ponto e vírgula é opcional no Portugol Studio. */
  private endStatement(): string {
    if (this.is(';')) this.pos++
    return ';'
  }

  private declaration(): string {
    const type = this.tokens[this.pos++].text
    const parts: string[] = []
    do {
      if (this.is(',')) this.pos++
      const name = this.tok
      if (name.kind !== 'id' || KEYWORDS.has(name.text) || name.text in PORTUGOL_NAMES) {
        this.fail(`esperava o nome de uma variável depois de "${type}", mas encontrei ${this.describe(name)}`)
      }
      this.pos++
      const init = this.is('=') ? (this.pos++, this.expression()) : undefined
      this.scopes[this.scopes.length - 1].add(name.text)
      parts.push(init === undefined ? name.text : `${name.text} = ${init}`)
    } while (this.is(','))
    return `let ${parts.join(', ')}`
  }

  /** Chamada de função, atribuição, ++ ou --. */
  private simple(): string {
    const name = this.tokens[this.pos++]
    if (this.is('(')) {
      return this.call(name)
    }
    if (!this.declared(name.text)) {
      throw new PortugolError(name.line, `a variável "${name.text}" não foi declarada (declare antes, por exemplo: inteiro ${name.text})`)
    }
    if (this.is('++') || this.is('--')) return `${name.text}${this.tokens[this.pos++].text}`
    for (const op of ['=', '+=', '-=', '*=', '/=']) {
      if (this.is(op)) {
        this.pos++
        return `${name.text} ${op} ${this.expression()}`
      }
    }
    this.fail(`depois de "${name.text}" esperava "=", "++" ou "--", mas encontrei ${this.describe(this.tok)}`)
  }

  private call(name: Token): string {
    const js = PORTUGOL_NAMES[name.text]
    if (!js) throw new PortugolError(name.line, `a função "${name.text}" não existe`)
    this.expect('(', `depois de "${name.text}"`)
    this.expect(')', `depois de "${name.text}(" (as funções do jogo não recebem valores)`)
    return `${js}()`
  }

  private ifStatement(): string {
    this.pos++
    this.expect('(', 'depois de "se"')
    const cond = this.expression()
    this.expect(')', 'para fechar a condição do "se"')
    let out = `if (${cond}) ${this.block('depois da condição do "se"')}`
    if (this.is('senao')) {
      this.pos++
      out += this.is('se') ? ` else ${this.ifStatement()}` : ` else ${this.block('depois de "senao"')}`
    }
    return out
  }

  private forStatement(): string {
    this.pos++
    this.expect('(', 'depois de "para"')
    this.scopes.push(new Set())
    const init = TYPES.has(this.tok.text) ? this.declaration() : this.is(';') ? '' : this.simple()
    this.expect(';', 'depois do início do "para"')
    const cond = this.is(';') ? '' : this.expression()
    this.expect(';', 'depois da condição do "para"')
    const step = this.is(')') ? '' : this.simple()
    this.expect(')', 'para fechar o "para"')
    const body = this.block('depois do cabeçalho do "para"')
    this.scopes.pop()
    return `for (${init}; ${cond}; ${step}) ${body}`
  }

  // Precedência: ou < e < igualdade < comparação < soma < produto < unário
  private expression(): string { return this.binary(0) }

  private static LEVELS: Array<Record<string, string>> = [
    { ou: '||', '||': '||' },
    { e: '&&', '&&': '&&' },
    { '==': '===', '!=': '!==' },
    { '<': '<', '>': '>', '<=': '<=', '>=': '>=' },
    { '+': '+', '-': '-' },
    { '*': '*', '/': '/', '%': '%' },
  ]

  private binary(level: number): string {
    if (level >= Parser.LEVELS.length) return this.unary()
    let left = this.binary(level + 1)
    for (;;) {
      const t = this.tok
      const js = t.kind === 'op' || t.kind === 'id' ? Parser.LEVELS[level][t.text] : undefined
      if (!js || !Object.hasOwn(Parser.LEVELS[level], t.text)) return left
      this.pos++
      left = `${left} ${js} ${this.binary(level + 1)}`
    }
  }

  private unary(): string {
    if (this.is('nao') || this.is('!')) { this.pos++; return `!${this.unary()}` }
    if (this.is('-')) { this.pos++; return `-${this.unary()}` }
    return this.primary()
  }

  private primary(): string {
    const t = this.tok
    if (t.kind === 'num' || t.kind === 'str') { this.pos++; return t.text }
    if (this.is('(')) {
      this.pos++
      const e = this.expression()
      this.expect(')', 'para fechar o parêntese da expressão')
      return `(${e})`
    }
    if (t.kind === 'id') {
      if (t.text === 'verdadeiro') { this.pos++; return 'true' }
      if (t.text === 'falso') { this.pos++; return 'false' }
      if (KEYWORDS.has(t.text)) this.fail(`não esperava a palavra "${t.text}" dentro de uma expressão`)
      this.pos++
      if (this.is('(')) return this.call(t)
      if (!this.declared(t.text)) {
        throw new PortugolError(t.line, `a variável "${t.text}" não foi declarada`)
      }
      return t.text
    }
    this.fail(`esperava um valor ou uma condição, mas encontrei ${this.describe(t)}`)
  }
}

/** Traduz Portugol para o corpo de uma função JavaScript. Lança PortugolError em erros de sintaxe. */
export function compilePortugol(code: string): string {
  return new Parser(tokenize(code)).parseProgram()
}
