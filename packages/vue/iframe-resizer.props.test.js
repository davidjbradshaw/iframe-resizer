import { describe, expect, it } from 'vitest'

describe('vue/iframe-resizer.vue props', () => {
  it('exports component options with expected name and props', async () => {
    const { default: comp } = await import('./iframe-resizer.vue')
    expect(comp.name).toBe('IframeResizer')
    const { props } = comp
    expect(props.license).toMatchObject({ type: String, required: true })
    expect(props.log).toMatchObject({ default: undefined })
    const { validator } = props.log
    expect(validator('expanded')).toBe(true)
    expect(validator('collapsed')).toBe(true)
    expect(validator(true)).toBe(true)
    expect(validator(false)).toBe(true)
    expect(validator(-1)).toBe(true)
    expect(validator('other')).toBe(false)
  })
})
