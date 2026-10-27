import Alpine from 'alpinejs'
import IframeResizer from '@iframe-resizer/alpine'
import { updates } from '../../../shared/app'

// For the x-data expression in index.html, by a name its data does not use
window.e2eUpdates = updates

Alpine.plugin(IframeResizer)
Alpine.start()
