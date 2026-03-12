/**
 * APPLICATION ENTRY POINT
 * This is the root JavaScript file that initializes the Vue application.
 * It bootstraps all the core plugins, including the State Manager (Pinia), 
 * the Navigation Router, and the Global Style system.
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Load global CSS architecture containing design tokens and layout primitives.
import './style.css'

// 1. Instantiate the Vue application using the root App component.
const app = createApp(App)

// 2. Plugin Integration: Enable system-wide reactive state management.
app.use(createPinia())

// 3. Plugin Integration: Enable the URL routing system.
app.use(router)

// 4. Initialization: Mount the application instance into the DOM at the #app hook.
app.mount('#app')
