// Re-export all types from types.ts
export * from './types'

// TODO: Migrate index.js to index.ts, export index.d.ts using dts() plugin in rollup.config.mjs and remove this file
declare function connectResizer(
  options: Partial<
    import('./types').ResizerOptions & import('./types').ResizerEvents
  >,
): (iframe: HTMLIFrameElement) => import('./types').IFrameObject

export default connectResizer
