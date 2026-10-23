import { createApp } from 'vue'

import App from './App.vue'
import KeepAliveApp from './KeepAliveApp.vue'

// ?keepalive shows the iframe in a pane that <KeepAlive> caches when hidden
const keepAlive = new URLSearchParams(location.search).has('keepalive')

createApp(keepAlive ? KeepAliveApp : App).mount('#app')
