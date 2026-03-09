<script setup>
/**
 * LOGIN VIEW
 * The entry gate for all registered users.
 * Handles identity verification (Email/Password) and redirects users 
 * to their respective role-based dashboards upon successful authentication.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'

// Component-level access to routing and auth persistence.
const router = useRouter()
const authStore = useAuthStore()

// --- FORM STATE ---
// User-provided credentials bound via BaseInput (v-model).
const email = ref('')
const password = ref('')
// Tracks submission lifecycle to manage button loading states.
const isLoading = ref(false)
// Holds localized error feedback if authentication fails.
const error = ref('')

/**
 * handleLogin - Validates credentials against the simulated registry.
 * Uses a small artificial delay to simulate network rounds for a better UX.
 */
const handleLogin = async () => {
  error.value = ''
  
  // 1. Basic client-side empty-state check.
  if (!email.value || !password.value) {
    error.value = 'Identity credentials are required.'
    return
  }

  // Set the visual busy state.
  isLoading.value = true
  
  // 2. Simulated latency (800ms) to mimic professional backend interaction.
  setTimeout(() => {
    // 3. Store-level authentication check.
    const res = authStore.login(email.value, password.value)
    
    if (res.success) {
      // 4. On success, route to the dashboard corresponding to the user's role.
      router.push(`/${res.role}`)
    } else {
      // On failure, display the store's error message.
      error.value = res.message
      isLoading.value = false
    }
  }, 800)
}
</script>

<template>
  <!-- Main Auth Page Layout (Centered surgical clean look) -->
  <div class="auth-page">
    <!-- Back to landing page link -->
    <router-link to="/" class="back-link">← Return to Front Desk</router-link>
    
    <div class="auth-card">
      <header class="auth-header">
        <div class="auth-logo">
           <img src="../../assets/logo.jpeg" alt="MediTrack Logo" class="auth-logo-img" />
        </div>
        <h1>Identity Verification</h1>
        <p class="auth-subtitle">Welcome back. Please verify your system credentials.</p>
      </header>

      <!-- 
        Main Login Form
        Uses @submit.prevent to prevent default page reloads and handle via JS.
      -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <!-- Reusable Input Components with built-in styling -->
        <BaseInput
          v-model="email"
          label="Access ID (Email)"
          type="email"
          placeholder="admin@medi.com or doctor@medi.com"
          required
        />

        <BaseInput
          v-model="password"
          label="Passkey"
          type="password"
          placeholder="Enter your password"
          required
        />

        <!-- Global Error Alert display -->
        <div v-if="error" class="auth-error" aria-live="polite">
          {{ error }}
        </div>

        <!-- Primary Action Button: Triggers the handleLogin function -->
        <BaseButton 
          type="submit" 
          variant="primary" 
          size="lg" 
          class="submit-btn"
          :is-loading="isLoading"
        >
          Verify Identity
        </BaseButton>
        
        <!-- Navigation to Registration for new Patients -->
        <div class="auth-footer">
          <p class="auth-hint">New clinical participant?</p>
          <router-link to="/register" class="auth-link">Create Patient Account</router-link>
        </div>
      </form>
    </div>

  </div>
</template>

<style scoped>
/* Flexbox-based centering for a focused authentication experience */
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-muted);
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-pure);
  padding: 3rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-xl);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-logo-img {
  height: 60px;
  width: auto;
  margin-bottom: 1.5rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  color: var(--text-dim);
  font-size: 0.95rem;
  font-weight: 700;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Red alert style for authentication errors */
.auth-error {
  padding: 0.875rem;
  background: var(--error-bg);
  color: var(--error-text);
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  border: 1px solid var(--error-border);
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--bg-muted);
}

.auth-hint {
  font-size: 0.9rem;
  color: var(--text-dim);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.auth-link {
  color: var(--primary-main);
  font-weight: 700;
  text-decoration: none;
}

.back-link {
  position: absolute;
  top: 3rem;
  left: 3rem;
  color: var(--text-dim);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: color 0.2s;
}



@media (max-width: 640px) {
  .auth-card { padding: 2rem; }
  .back-link { position: static; margin-bottom: 2rem; }
}
</style>
