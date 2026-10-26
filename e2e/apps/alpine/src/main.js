import Alpine from 'alpinejs'
import IframeResizer from '@iframe-resizer/alpine'
import { updates } from '../../../shared/app'

// For the x-data expression in index.html
window.updates = updates

Alpine.plugin(IframeResizer)
Alpine.start()
