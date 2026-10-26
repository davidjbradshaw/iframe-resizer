import Alpine from 'alpinejs'
import IframeResizer from '@iframe-resizer/alpine'
import { record, updates } from '../../../shared/app'

// For the x-data expression in index.html, by names its data does not use
window.record = record
window.e2eUpdates = updates

Alpine.plugin(IframeResizer)
Alpine.start()
