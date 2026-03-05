<script setup>
/**
 * ADMIN USER MANAGEMENT
 * This is the central control center for managing all system identities (Doctors, Patients, Admins).
 * It allows administrators to search the registry, provision new clinical providers, 
 * and revoke access for existing users.
 */
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'
import { useAuthStore } from '../../stores/authStore'
import { validateEmail, sanitize } from '../../utils/securityUtils'

// Access the global authentication store to manage the user registry.
const authStore = useAuthStore()

// --- UI STATE ---
// Reactive flag to control the visibility of the "Add Doctor" modal.
const showProvisionModal = ref(false)
// Tracks the submission state to show loading indicators during provisioning.
const isSubmitting = ref(false)
// Holds validation or system error messages for display in the UI.
const errorMessage = ref('')
// User input for real-time table filtering.
const filterQuery = ref('')

// --- DATA DERIVATION ---
/**
 * filteredUsers - Computed property that provides a filtered subset of the user registry.
 * Performs a case-insensitive search across names, emails, and roles.
 */
const filteredUsers = computed(() => {
  // If the search box is empty, return the full list.
  if (!filterQuery.value) return authStore.allUsers
  
  const q = filterQuery.value.toLowerCase()
  return authStore.allUsers.filter(u => 
    u.name.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q) || 
    u.role.toLowerCase().includes(q)
  )
})

// --- FORM DATA ---
/**
 * newDoctor - Reactive object used to bind the provisioning form data.
 * Initially seeded with a default passkey.
 */
const newDoctor = ref({
  name: '',
  email: '',
  specialization: '',
  password: 'password' // Initial default passkey for new clinical providers.
})

/**
 * provisionDoctor - Logic to register a new professional account in the system.
 * Includes validation, sanitization, and a simulated network latency.
 */
const provisionDoctor = async () => {
  errorMessage.value = ''
  
  // 1. Basic empty-field validation.
  if (!newDoctor.value.name || !newDoctor.value.email || !newDoctor.value.specialization) {
    errorMessage.value = 'Complete doctor profile is required.'
    return
  }

  // 2. Email format validation via utility.
  if (!validateEmail(newDoctor.value.email)) {
    errorMessage.value = 'Identity Error: Invalid professional email format.'
    return
  }

  // Trigger loading state.
  isSubmitting.value = true
  
  // 3. Simulated API delay to give the user visual feedback.
  setTimeout(() => {
    // 4. Sanitize inputs before persistent injection into the authStore.
    authStore.provisionDoctor({ 
      ...newDoctor.value,
      name: sanitize(newDoctor.value.name),
      email: sanitize(newDoctor.value.email),
      specialization: sanitize(newDoctor.value.specialization)
    })
    
    // 5. Cleanup UI state and reset form.
    newDoctor.value = { name: '', email: '', specialization: '', password: 'password' }
    isSubmitting.value = false
    showProvisionModal.value = false
  }, 800)
}

/**
 * revokeAccess - Removes a user from the system registry.
 * Prevents unintentional deletion of other administrators for system stability.
 */
const revokeAccess = (user) => {
  // Guard: Protect administrative accounts from self-deletion or external removal here.
  if (user.role === 'admin') {
    alert('System Administrators cannot be removed.')
    return
  }
  
  // Confirmation dialog before irreversible action.
  if (confirm(`Permanently revoke access for ${user.name}? This cannot be undone.`)) {
    authStore.deleteUser(user.id)
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Page title defined in the standard header slot -->
    <template #header-title>User Management</template>

    <div class="management-container">
      <BaseCard>
        <template #header>
          <div class="management-header">
            <!-- Section Header and Context -->
            <div class="header-left">
              <h2>Identity Registry</h2>
              <p class="subtitle">Search, manage and provision system access.</p>
            </div>
            
            <!-- Dynamic Actions: Search and Provisioning -->
            <div class="header-actions">
              <!-- Accessible search label for screen readers -->
              <label for="admin-user-search" class="sr-only">Search identities and users</label>
              <input 
                id="admin-user-search"
                v-model="filterQuery" 
                type="text" 
                placeholder="Search users..." 
                class="search-input"
              />
              <!-- Button to trigger the doctor provisioning modal -->
              <BaseButton @click="showProvisionModal = true" variant="primary">
                + Add Doctor
              </BaseButton>
            </div>
          </div>
        </template>

        <!-- Empty State UI -->
        <div v-if="filteredUsers.length === 0" class="empty-results">
          <p>No users found matching your search.</p>
        </div>

        <!-- System User Table -->
        <div v-else class="table-wrapper">
          <table class="user-table">
            <thead>
              <tr>
                <th>System User</th>
                <th>Specialization</th>
                <th>Access Identity</th>
                <th>Assigned Role</th>
                <th class="text-right">Administration</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loop through the filtered user list -->
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>
                  <div class="user-profile-cell">
                    <!-- Circular avatar based on the first letter of the name -->
                    <div class="avatar" :class="user.role">{{ user.name[0] }}</div>
                    <div class="user-info">
                      <span class="name">{{ user.name }}</span>
                      <!-- Mobile optimization for specialization display -->
                      <span v-if="user.role === 'doctor'" class="mobile-specialization">{{ user.specialization || 'General' }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-if="user.role === 'doctor'" class="specialization-text">{{ user.specialization || 'General Consultation' }}</span>
                  <span v-else class="na-text">—</span>
                </td>
                <td>
                  <span class="email">{{ user.email }}</span>
                </td>
                <td>
                  <!-- Colored pill indicating the user's role -->
                  <span :class="['role-pill', user.role]">{{ user.role }}</span>
                </td>
                <td class="text-right">
                  <!-- Revocation action allowed only for non-admin users -->
                  <button 
                    v-if="user.role !== 'admin'" 
                    @click="revokeAccess(user)" 
                    class="btn-revoke"
                  >
                    Revoke Access
                  </button>
                  <span v-else class="protected-label">Protected</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>
    </div>

    <!-- PROVISION DOCTOR MODAL (Accessibility-friendly transition) -->
    <Transition name="fade">
      <div v-if="showProvisionModal" class="modal-overlay" @click.self="showProvisionModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add New Clinical Provider</h3>
            <button class="close-btn" @click="showProvisionModal = false">✕</button>
          </div>
          
          <form @submit.prevent="provisionDoctor" class="modal-form">
            <!-- Standardized inputs with built-in validation support via base component -->
            <BaseInput
              id="provision-name"
              v-model="newDoctor.name"
              label="Doctor's Full Name"
              placeholder="e.g. Dr. Robert Wilson"
              required
            />

            <BaseInput
              id="provision-email"
              v-model="newDoctor.email"
              label="Professional Email"
              type="email"
              placeholder="clinical@meditrack.com"
              required
            />

            <BaseInput
              id="provision-specialization"
              v-model="newDoctor.specialization"
              label="Medical Specialization"
              placeholder="e.g. Neurology, Dermatology, Cardiology"
              required
            />

            <!-- Auto-generated passkey display (Readonly for security consistency) -->
            <div class="form-group">
              <label for="provision-passkey">Initial Passkey</label>
              <input 
                id="provision-passkey"
                v-model="newDoctor.password" 
                type="text" 
                class="styled-input" 
                readonly
              />
              <p class="field-hint">The doctor can change this after their first login.</p>
            </div>

            <!-- Error message feedback area -->
            <div v-if="errorMessage" class="error-msg">
              ⚠️ {{ errorMessage }}
            </div>

            <!-- Modal footer actions -->
            <div class="modal-footer">
              <BaseButton type="button" variant="ghost" @click="showProvisionModal = false">Cancel</BaseButton>
              <BaseButton type="submit" variant="primary" :is-loading="isSubmitting">
                Confirm Registration
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </DashboardLayout>
</template>

<style scoped>
/* Main container constraint for readability */
.management-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* Header layout for titles and search box */
.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.subtitle {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Styled search input specific to this view's density */
.search-input {
  padding: 0.625rem 1.25rem;
  border: 1px solid var(--glass-border);
  background: var(--bg-faint);
  color: var(--text-main);
  border-radius: 10px;
  outline: none;
  width: 260px;
  font-size: 0.9rem;
}

.search-input:focus {
  border-color: var(--primary-main);
  background: var(--bg-pure);
}

.table-wrapper {
  overflow-x: auto;
}

/* Standardized table layout for user registry */
.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th {
  text-align: left;
  padding: 1rem;
  background: var(--bg-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-dim);
  border-bottom: 2px solid var(--glass-border);
}

.user-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--bg-muted);
}

.user-profile-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Avatar styling with role-based colors */
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
}

.avatar.admin { background: var(--error-bg); color: var(--error-text); }
.avatar.doctor { background: rgba(52, 211, 153, 0.1); color: var(--secondary-main); }
.avatar.patient { background: var(--primary-light); color: var(--primary-main); }

.name { font-weight: 700; color: var(--text-main); }
.user-info { display: flex; flex-direction: column; }
.mobile-specialization { display: none; font-size: 0.75rem; color: var(--primary-main); font-weight: 600; }
.specialization-text { font-size: 0.9rem; font-weight: 600; color: var(--primary-main); }
.na-text { color: var(--text-dim); font-weight: 800; }

/* Hidden utility for accessibility-first design */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
.email { font-size: 0.9rem; color: var(--text-dim); }

/* Role pill styling for consistent status visualization */
.role-pill {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.role-pill.admin { background: var(--error-bg); color: var(--error-text); }
.role-pill.doctor { background: rgba(52, 211, 153, 0.1); color: var(--secondary-main); }
.role-pill.patient { background: rgba(59, 130, 246, 0.1); color: var(--primary-main); }

.text-right { text-align: right; }

.btn-revoke {
  background: none;
  border: none;
  color: var(--error-text);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-revoke:hover { text-decoration: underline; }

.protected-label {
  color: var(--text-dim);
  font-size: 0.85rem;
  font-weight: 600;
  font-style: italic;
}

.empty-results {
  text-align: center;
  padding: 4rem;
  color: var(--text-dim);
}

/* MODAL: Fixed positioning overlay for focused task completion */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--bg-pure);
  width: 100%;
  max-width: 450px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--bg-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 1.25rem; }

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--text-dim);
}

.modal-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dim);
}

.styled-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--bg-muted);
  border-radius: 10px;
  font-size: 0.95rem;
  background: var(--bg-faint);
  color: var(--text-dim);
  cursor: not-allowed;
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-dim);
  font-style: italic;
}

.error-msg {
  background: var(--error-bg);
  color: var(--error-text);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  margin-top: -0.5rem;
  border: 1px solid var(--error-border);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--bg-muted);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Transition animations */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
