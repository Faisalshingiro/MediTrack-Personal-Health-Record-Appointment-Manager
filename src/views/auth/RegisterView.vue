<script setup>
/**
 * REGISTER VIEW
 * This view allows new patients to self-enroll into the MediTrack ecosystem.
 * All registrations via this portal are automatically assigned the 'patient' role.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { validateEmail, validatePassword } from '../../utils/securityUtils'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'

// Access routers and stores for cross-functional registration logic.
const router = useRouter()
const authStore = useAuthStore()

// --- FORM STATE ---
// Reactive patient profile data captured from the form fields.
const name = ref('')
const email = ref('')
const password = ref('')

// Tracks validation and simulation lifecycle.
const isLoading = ref(false)
const error = ref('')

/**
 * handleRegister - Orchestrates the patient enrollment process.
 * Includes data integrity checks and simulated persistence delay.
 */
const handleRegister = async () => {
  error.value = ''
  
  // 1. Mandatory field checks.
  if (!name.value || !email.value || !password.value) {
    error.value = 'Full clinical profile is required.'
    return
  }

  // 2. Email format validation via system utility.
  if (!validateEmail(email.value)) {
    error.value = 'Identity Error: Invalid email format.'
    return
  }

  // 3. Security check: Enforce minimum password complexity.
  if (!validatePassword(password.value)) {
    error.value = 'Security Error: Passkey must be at least 6 characters.'
    return
  }

  // Set the visual busy state to inform the user.
  isLoading.value = true
  
  // 4. Simulated backend registration delay (1000ms).
  setTimeout(() => {
    // 5. Invoke the registration action in the auth store.
    const res = authStore.registerUser({
      name: name.value,
      email: email.value,
      password: password.value
    })
    
    if (res.success) {
      // 6. On success, auto-transfer to login so user can verify credentials.
      router.push('/login')
    } else {
      error.value = 'Registration failed. System registry is busy.'
      isLoading.value = false
    }
  }, 1000)
}
</script>

<template>
  <!-- Main Registration Page Layout -->
  <div class="auth-page">
    <router-link to="/" class="back-link">← Front Desk</router-link>
    
    <div class="auth-card">
      <header class="auth-header">
        <h1>Patient Enrollment</h1>
        <p class="auth-subtitle">Create your digital healthcare identity.</p>
      </header>

      <!-- Standard Patient Registration Form -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <BaseInput
          v-model="name"
          label="Legal Full Name"
          placeholder="e.g. Johnathan Doe"
          required
        />

        <BaseInput
          v-model="email"
          label="Primary Email"
          type="email"
          placeholder="john@example.com"
          required
        />

        <BaseInput
          v-model="password"
          label="Create Passkey"
          type="password"
          placeholder="Min. 6 high-security characters"
          required
        />

        <!-- Validation Error display -->
        <div v-if="error" class="auth-error">
          {{ error }}
        </div>

        <!-- Submission Trigger with loading feedback -->
        <BaseButton 
          type="submit" 
          variant="primary" 
          size="lg" 
          class="submit-btn"
          :is-loading="isLoading"
        >
          Initialize Account
        </BaseButton>
        
        <!-- Redirect for already registered participants -->
        <div class="auth-footer">
          <p class="auth-hint">Already have an identity?</p>
          <router-link to="/login" class="auth-link">Sign in to Dashboard</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Symmetric centering with a professional clean background */
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
  margin: auto;
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
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
}

@media (max-width: 640px) {
  .auth-card { padding: 2rem; }
  .back-link { position: static; margin-bottom: 2rem; text-align: center; }
}
</style>
