import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { installImmersive } from './immersive.js'

installImmersive()

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

import './accessibility.css'
