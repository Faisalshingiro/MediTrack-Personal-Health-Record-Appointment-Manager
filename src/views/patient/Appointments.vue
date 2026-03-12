<script setup>
/**
 * PATIENT APPOINTMENTS VIEW
 * Provides a comprehensive interface for patients to manage their clinical lifecycle.
 * Features: View scheduled visits, book new sessions, edit existing bookings, and irreversible cancellations.
 */
import { ref, computed, watch } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useAuthStore } from '../../stores/authStore'

// Initialize state stores for appointment logic and user identity.
const appointmentStore = useAppointmentStore()
const authStore = useAuthStore()

// --- UI STATE ---
// Reactive flag to toggle the booking/editing interaction modal.
const showModal = ref(false)
// Distinguishes if the modal is in 'Create' or 'Update' mode.
const isEditing = ref(false)
// Manages button loading feedback during simulated persistence.
const isSubmitting = ref(false)
// Stores the ID of the appointment being modified.
const editingId = ref(null)

// --- DATA DERIVATION ---
/**
 * availableDoctors - Filters the system registry for professional medical staff.
 */
const availableDoctors = computed(() => {
  return authStore.allUsers.filter(u => u.role === 'doctor')
})

// Returns only the appointments belonging to the active patient profile.
const myAppointments = computed(() => appointmentStore.patientAppointments)

// --- FORM DATA ---
// Shared buffer for both booking and editing clinical sessions.
const form = ref({
  doctor: '',
  date: '',
  time: '',
  reason: ''
})

/**
 * watch(showModal) - Side effect to ensure the form has a valid provider selected.
 */
watch(showModal, (val) => {
  if (val && !isEditing.value && availableDoctors.value.length > 0) {
    form.value.doctor = availableDoctors.value[0].name
  }
})

/**
 * openBookModal - Enters 'Create' mode and resets form buffers.
 */
const openBookModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { doctor: '', date: '', time: '', reason: '' }
  showModal.value = true
}

/**
 * openEditModal - Enters 'Update' mode and populates the form with existing data.
 */
const openEditModal = (apt) => {
  isEditing.value = true
  editingId.value = apt.id
  form.value = { 
    doctor: apt.doctor, 
    date: apt.date, 
    time: apt.time, 
    reason: apt.reason || '' 
  }
  showModal.value = true
}

/**
 * handleSubmit - Consolidates logic for both NEW bookings and UPDATES.
 * Includes simulated latency for operational feedback.
 */
const handleSubmit = async () => {
  // Guard: Required scheduling fields.
  if (!form.value.date || !form.value.time) return
  
  isSubmitting.value = true
  
  // Simulated backend processing cycle.
  setTimeout(() => {
    if (isEditing.value) {
      // 1a. UPDATE: Modify an existing record in the schedule store.
      appointmentStore.updateAppointment(editingId.value, { ...form.value })
    } else {
      // 1b. CREATE: Persist a new clinical visit request.
      appointmentStore.addAppointment({
        ...form.value,
        patientId: authStore.currentUser.id,
        patientName: authStore.currentUser.name
      })
    }
    
    // UI Cleanup once operations succeed.
    isSubmitting.value = false
    showModal.value = false
  }, 600)
}

/**
 * cancelAppointment - Permanently removes a scheduled interaction.
 * Triggered via confirmation dialog to prevent data loss.
 */
const cancelAppointment = (id) => {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    appointmentStore.deleteAppointment(id)
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Slot override for view title in the sidebar-shell layout -->
    <template #header-title>My Appointments</template>

    <div class="appointments-container">
      <BaseCard>
        <template #header>
          <div class="section-header">
            <div>
              <h2>Scheduled Consultations</h2>
              <p class="subtitle">Manage your upcoming visits with healthcare providers.</p>
            </div>
            <!-- Primary Action: Open the booking workflow -->
            <BaseButton @click="openBookModal" variant="primary">
              + Book Appointment
            </BaseButton>
          </div>
        </template>

        <!-- Empty State UI: Displayed when no clinical timeline exists for the user -->
        <div v-if="myAppointments.length === 0" class="empty-state">
          <svg class="empty-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h4>No appointments yet</h4>
          <p>You haven't scheduled any consultations. Click the button above to book your first visit.</p>
          <BaseButton variant="ghost" @click="openBookModal">Book Now</BaseButton>
        </div>

        <!-- Appointment List Grid -->
        <div v-else class="appointments-list">
          <div v-for="apt in myAppointments" :key="apt.id" class="appointment-item">
            <div class="apt-main">
              <!-- Visual indicator for visit type -->
              <div class="apt-icon" aria-hidden="true">🩺</div>
              <div class="apt-details">
                <span class="doctor-name">{{ apt.doctor }}</span>
                <div class="apt-meta">
                  <span class="meta-item">📅 {{ apt.date }}</span>
                  <span class="meta-item">⏰ {{ apt.time }}</span>
                </div>
                <!-- Optional patient reason/notes -->
                <p v-if="apt.reason" class="apt-reason">Reason: {{ apt.reason }}</p>
              </div>
            </div>
            
            <!-- Side Actions: Status and Controls -->
            <div class="apt-actions">
              <span :class="['status-pill', apt.status]">{{ apt.status }}</span>
              <div class="btn-group">
                <!-- Revision and Deletion keys -->
                <button @click="openEditModal(apt)" class="btn-icon edit" aria-label="Edit Appointment">
                  <span aria-hidden="true">✏️</span>
                </button>
                <button @click="cancelAppointment(apt.id)" class="btn-icon delete" aria-label="Cancel Appointment">
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- BOOK/EDIT MODAL: The focused interaction surface for schedule management -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Edit Appointment' : 'Book New Appointment' }}</h3>
            <button class="close-btn" @click="showModal = false" aria-label="Close modal">✕</button>
          </div>
          
          <form @submit.prevent="handleSubmit" class="modal-form">
            <!-- DOCTOR SELECTION -->
            <div class="form-group">
              <label for="doc-registry">Choose Doctor</label>
              <select id="doc-registry" v-model="form.doctor" class="styled-select">
                <option v-for="doc in availableDoctors" :key="doc.id" :value="doc.name">
                  {{ doc.name }} ({{ doc.specialization || 'General Consultation' }})
                </option>
              </select>
            </div>

            <!-- SCHEDULING ROW -->
            <div class="form-row">
              <BaseInput
                id="apt-date-edit"
                v-model="form.date"
                label="Appointment Date"
                type="date"
                required
              />
              <BaseInput
                id="apt-time-edit"
                v-model="form.time"
                label="Preferred Time"
                type="time"
                required
              />
            </div>

            <!-- CLINICAL NOTES (Optional) -->
            <div class="form-group">
              <label for="p-reason">Reason for Visit (Optional)</label>
              <textarea 
                id="p-reason"
                v-model="form.reason" 
                class="styled-textarea" 
                placeholder="Briefly describe your symptoms or concern..."
                rows="3"
              ></textarea>
            </div>

            <div class="modal-footer">
              <BaseButton type="button" variant="ghost" @click="showModal = false">Cancel</BaseButton>
              <BaseButton type="submit" variant="primary" :is-loading="isSubmitting">
                {{ isEditing ? 'Save Changes' : 'Confirm Booking' }}
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </DashboardLayout>
</template>

<style scoped>
/* Main responsive container layout */
.appointments-container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 { margin: 0; font-size: 1.25rem; }

.subtitle {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
  font-weight: 600;
}

/* EMPTY STATE styling for initial users */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state h4 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.empty-state p {
  color: var(--text-dim, #64748b);
  max-width: 300px;
  margin: 0 auto 1.5rem;
}

.empty-svg {
  width: 56px;
  height: 56px;
  display: block;
  margin: 0 auto 1.5rem;
  color: var(--text-dim) !important;
  opacity: 0.15;
}

/* APPOINTMENT REGISTRY List Styling */
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appointment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: var(--bg-faint, #f8fafc);
  border: 1px solid var(--bg-muted, #f1f5f9);
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.appointment-item:hover {
  transform: translateX(4px);
  border-color: var(--primary-main);
  background: var(--bg-pure);
}

.apt-main {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.apt-icon {
  font-size: 1.5rem;
  background: var(--bg-pure);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
}

.doctor-name {
  display: block;
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.apt-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-dim);
  font-weight: 700;
}

.apt-reason {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--text-dim);
  font-style: italic;
}

.apt-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

/* Status markers: Sync colors with global design system */
.status-pill {
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill.pending { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.status-pill.approved { background: rgba(59, 130, 246, 0.15); color: var(--primary-dark); }
.status-pill.completed { background: rgba(16, 185, 129, 0.15); color: #047857; }

/* REVISION CONTROLS: Standard minimalist icons */
.btn-group {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: var(--bg-pure);
  border: 1px solid var(--glass-border);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover {
  border-color: var(--primary-main);
  background: var(--bg-faint);
}

.btn-icon.delete:hover { border-color: #ef4444; color: #ef4444; }

/* MODAL: Central interactive focus area */
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
  max-width: 500px;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem;
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
  color: var(--text-dim);
  cursor: pointer;
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dim);
  margin-left: 4px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Styled interactive elements for appointment revisions */
.styled-select, .styled-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--glass-border);
  background: var(--bg-faint);
  color: var(--text-main);
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.2s;
}

.styled-select:focus, .styled-textarea:focus {
  border-color: var(--primary-main);
  background: var(--bg-pure);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--bg-muted);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Standard clinical fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Responsive adjustments for handheld devices */
@media (max-width: 600px) {
  .appointment-item { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .form-row { grid-template-columns: 1fr; }
  .apt-actions { width: 100%; flex-direction: row; justify-content: space-between; align-items: center; }
}
</style>
