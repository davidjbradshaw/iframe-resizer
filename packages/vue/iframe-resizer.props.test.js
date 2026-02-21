import { describe, expect, it } from 'vitest'

describe('vue/iframe-resizer.vue props and methods', () => {
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

  it('defines methods that delegate to resizer', async () => {
    const { default: comp } = await import('./iframe-resizer.vue')
    // Just verify the methods exist; runtime delegation is covered in integration
    expect(comp.methods.moveToAnchor).toBeInstanceOf(Function)
    expect(comp.methods.resize).toBeInstanceOf(Function)
    expect(comp.methods.sendMessage).toBeInstanceOf(Function)
  })
})
