# Vue 3 + Vite + TypeScript + iframe-resizer

This example demonstrates how to use `@iframe-resizer/vue` with TypeScript in a Vue 3 project.

## Features

- **TypeScript Support**: Full type checking for iframe-resizer props, events, and methods
- **Vue 3 Composition API**: Uses `<script setup>` with TypeScript
- **Type-safe Event Handlers**: Properly typed event handlers for onReady, onMessage, and onResized

## Usage Example

```vue
<script setup lang="ts">
import IframeResizer from '@iframe-resizer/vue/sfc'
import type { IFrameComponent } from '@iframe-resizer/vue/sfc'

const handleReady = (iframe: IFrameComponent) => {
  console.log('onReady', iframe)
}

const handleResized = (data: { 
  iframe: IFrameComponent; 
  height: number; 
  width: number; 
  type: string 
}) => {
  console.log('Resized:', data.height, data.width)
}
</script>

<template>
  <IframeResizer
    src="https://example.com" 
    license="GPLv3"
    log="collapsed"
    @on-ready="handleReady"
    @on-resized="handleResized"
  />
</template>
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (includes type checking)
- `npm run type-check` - Run TypeScript type checking only
- `npm run preview` - Preview production build

## Type Definitions

The package includes complete TypeScript definitions for:

- Component props (license, direction, log, etc.)
- Event handlers (onReady, onMessage, onResized)
- Component methods (moveToAnchor, resize, sendMessage)
- IFrame interfaces (IFrameObject, IFrameComponent)

## IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar)

