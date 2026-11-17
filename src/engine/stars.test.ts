import { describe, expect, it } from 'vitest'
import { mergeStars } from './stars'

describe('mergeStars', () => {
  it('refazer com resultado pior não remove Estrelas já ganhas', () => {
    expect(mergeStars(['solved', 'fewInstructions'], ['solved'])).toEqual(['solved', 'fewInstructions'])
    expect(mergeStars(['solved'], [])).toEqual(['solved'])
  })

  it('refazer com resultado melhor acrescenta Estrelas', () => {
    expect(mergeStars(['solved'], ['solved', 'fewInstructions'])).toEqual(['solved', 'fewInstructions'])
  })
})
