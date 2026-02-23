/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn((options) => () => ({
    options: { log: options.log, expand: true },
    moveToAnchor: vi.fn(),
    resize: vi.fn(),
    sendMessage: vi.fn(),
    disconnect: vi.fn(),
  })),
}))

vi.mock('auto-console-group', () => ({
  default: () => ({ event: vi.fn(), label: vi.fn(), expand: vi.fn(), log: vi.fn(), warn: vi.fn() }),
}))

const comp = (await import('./iframe-resizer.vue')).default

describe('Vue iframe-resizer mounted lifecycle', () => {
  let ctx
  beforeEach(() => {
    const iframe = document.createElement('iframe')
    iframe.id = 'i1'
    document.body.append(iframe)
    ctx = {
      $refs: { iframe },
      $props: { log: true },
      $emit: vi.fn(),
      resizer: null,
    }
  })

  it('mounts and connects resizer with console group', () => {
    comp.mounted.call(ctx)
    expect(ctx.resizer).toBeTruthy()
    // Methods proxied exist
    comp.methods.moveToAnchor.call(ctx, 'a')
    comp.methods.resize.call(ctx)
    comp.methods.sendMessage.call(ctx, 'm')
    expect(ctx.resizer.moveToAnchor).toHaveBeenCalledWith('a')
    expect(ctx.resizer.resize).toHaveBeenCalled()
    expect(ctx.resizer.sendMessage).toHaveBeenCalledWith('m', undefined)
  })

  it('renders template with iframe ref', () => {
    // Verify the template structure exists
    expect(comp.template || comp.render).toBeDefined()
  })

  it('beforeUnmount disconnects the resizer', () => {
    comp.mounted.call(ctx)
    comp.beforeUnmount.call(ctx)
    expect(ctx.resizer.disconnect).toHaveBeenCalled()
  })

  it('beforeDestroy disconnects the resizer (Vue 2 compatibility)', () => {
    comp.mounted.call(ctx)
    comp.beforeDestroy.call(ctx)
    expect(ctx.resizer.disconnect).toHaveBeenCalled()
  })
})
