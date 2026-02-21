import { advise } from '../console'

const oldObjectName = (prop: string | symbol): string =>
  `<rb>Deprecated API object name</>
The <b>window.parentIFrame</> object has been renamed to <b>window.parentIframe</>. Please update your code as the old object will be removed in a future version.

Called property: '${String(prop)}'
`

export default function deprecationProxy(target: Record<string, any>): Record<string, any> {
  const warnedProps = new Set()

  return new Proxy(target, {
    get(target: Record<string, any>, prop: string | symbol) {
      if (!warnedProps.has(prop)) {
        advise(oldObjectName(prop))
        warnedProps.add(prop)
      }

      const value = target[prop]
      const descriptor = Object.getOwnPropertyDescriptor(target, prop)

      // If property is non-configurable and non-writable, return the actual value
      if (descriptor && !descriptor.configurable && !descriptor.writable) {
        return value
      }

      if (typeof value === 'function') {
        return value.bind(target)
      }

      return value
    },
  })
}
