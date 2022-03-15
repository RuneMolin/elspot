import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import 'bulma/css/bulma.min.css'
import 'bulma-checkradio/dist/css/bulma-checkradio.min.css'

const pinia = createPinia()

createApp(App).use(pinia).mount('#app')
