<script setup>
/**
 * PATIENT DASHBOARD
 * This is the central health management portal for patients.
 * It provides high-level health telemetry, quick appointment booking, 
 * and persistent access to personal medical logs.
 */
import { ref, computed, watch } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useRecordStore } from '../../stores/recordStore'
import { useAuthStore } from '../../stores/authStore'

// Access clinical, identity, and personal record stores.
const appointmentStore = useAppointmentStore()
const recordStore = useRecordStore()
const authStore = useAuthStore()

// --- UI STATE ---
// Reactive flags to control the visibility of interaction modals.
const showBookModal = ref(false)
const showRecordModal = ref(false)
// Tracks the submission lifecycle for loading feedback.
const isSubmitting = ref(false)

// --- DATA DERIVATION ---
/**
 * availableDoctors - Computed list of clinical providers from the system registry.
 * Filters the global user list to only include professional staff.
 */
const availableDoctors = computed(() => {
  return authStore.allUsers.filter(u => u.role === 'doctor')
})

// --- FORM DATA ---
/**
 * newAppointment - Reactive object for binding the 'Request Consultation' form.
 */
const newAppointment = ref({
  doctor: '', 
  date: '',
  time: '',
  reason: ''
})

/**
 * watch(showBookModal) - Side effect to pre-populate the doctor selection.
 * Ensures the form is never in an invalid empty state when opened.
 */
watch(showBookModal, (val) => {
  if (val && availableDoctors.value.length > 0) {
    newAppointment.value.doctor = availableDoctors.value[0].name
  }
})

/**
 * newRecord - Reactive object for binding the 'Personal Note' form.
 */
const newRecord = ref({
  title: '',
  content: ''
})

/**
 * bookAppointment - Logic to request a new clinical meeting.
 * Includes validation and simulated network latency for professional UX.
 */
const bookAppointment = async () => {
  if (!newAppointment.value.date || !newAppointment.value.time) return
  
  isSubmitting.value = true
  
  // Simulated backend processing (800ms rounds).
  setTimeout(() => {
    // 1. PERSISTENCE: Save the new appointment to the local store.
    appointmentStore.addAppointment({
      ...newAppointment.value,
      patientId: authStore.currentUser.id,
      patientName: authStore.currentUser.name
    })
    
    // 2. CLEANUP: Reset the form and close the interaction surface.
    newAppointment.value = { doctor: '', date: '', time: '', reason: '' }
    isSubmitting.value = false
    showBookModal.value = false
  }, 800)
}

/**
 * addPersonalNote - Saves a non-clinical personal observation to the health timeline.
 */
const addPersonalNote = () => {
  if (!newRecord.value.title || !newRecord.value.content) return
  
  // 1. PERSISTENCE: Record the note in the Medical Record store as a 'personal' entry.
  recordStore.addRecord({
    ...newRecord.value,
    userId: authStore.currentUser.id,
    type: 'personal' // Distinguished from doctor-issued 'official' records.
  })
  
  // 2. CLEANUP: Reset UI state.
  newRecord.value = { title: '', content: '' }
  showRecordModal.value = false
}

// --- DATA DERIVATION (Role-Scoped) ---
// Fetches only data pertaining to the logged-in patient identity.
const myAppointments = computed(() => appointmentStore.patientAppointments)
const myRecords = computed(() => recordStore.authorizedRecords)

/**
 * stats - Computed analytics for the dashboard hero widgets.
 * Provides immediate feedback on visit volume and record density.
 */
const stats = computed(() => [
  { label: 'Upcoming Visits', value: myAppointments.value.length, icon: '📅' },
  { label: 'Saved Records', value: myRecords.value.length, icon: '📁' },
  { label: 'Health Score', value: 'Good', icon: '✨' }
])
</script>

<template>
  <DashboardLayout>
    <!-- Page title defined via named slot for the layout shell -->
    <template #header-title>Patient Dashboard</template>

    <!-- 
      QUICK STATS GRID 
      Displays high-level telemetry of the patient's interaction with the clinic.
    -->
    <div class="stats-overview">
      <BaseCard v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-content">
          <span class="stat-icon">{{ stat.icon }}</span>
          <div class="stat-info">
            <p class="stat-label">{{ stat.label }}</p>
            <h3 class="stat-value">{{ stat.value }}</h3>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 
      MAIN CONTENT GRID 
      Responsive layout containing the primary historical lists and call-to-actions.
    -->
    <div class="patient-grid">
      
      <!-- APPOINTMENTS SECTION: Active clinical schedules -->
      <BaseCard title="Scheduled Consultations" class="main-section">
        <template #header>
          <div class="section-header">
            <h2>Upcoming visits</h2>
            <BaseButton @click="showBookModal = true" size="sm" variant="primary">
              + New Appointment
            </BaseButton>
          </div>
        </template>

        <!-- Empty state fallback if the patient has no active schedule -->
        <div v-if="myAppointments.length === 0" class="empty-placeholder">
          <span class="empty-icon">📅</span>
          <p>No upcoming visits scheduled.</p>
          <div class="empty-actions">
            <BaseButton variant="ghost" size="sm" @click="showBookModal = true">Book now</BaseButton>
          </div>
        </div>

        <!-- High-density list of the next 3 visits -->
        <div v-else class="data-list">
          <div v-for="apt in myAppointments.slice(0, 3)" :key="apt.id" class="data-item">
            <div class="item-visual">🩺</div>
            <div class="item-info">
              <p class="item-title">{{ apt.doctor }}</p>
              <p class="item-sub">{{ apt.date }} • {{ apt.time }}</p>
            </div>
          </div>
          <!-- Internal link to full scheduling portal -->
          <div class="card-action-footer">
            <router-link to="/patient/appointments" class="view-all-link">Manage All Appointments →</router-link>
          </div>
        </div>
      </BaseCard>

      <!-- RECORDS SECTION: Personal health journal -->
      <BaseCard title="Personal Medical Notes" class="main-section">
        <template #header>
          <div class="section-header">
            <h2>Health Records</h2>
            <BaseButton @click="showRecordModal = true" size="sm" variant="secondary">
              Add Note
            </BaseButton>
          </div>
        </template>

        <div v-if="myRecords.length === 0" class="empty-placeholder">
          <span class="empty-icon">📝</span>
          <p>Your health timeline is empty.</p>
        </div>

        <!-- Preview grid of the latest personal health entries -->
        <div v-else class="record-summary-list">
          <div v-for="record in myRecords.slice(0, 2)" :key="record.id" class="record-summary-item">
            <span class="record-date">{{ record.date }}</span>
            <h4>{{ record.title }}</h4>
            <p>{{ record.content.substring(0, 60) }}...</p>
          </div>
          <div class="card-action-footer">
            <router-link to="/patient/records" class="view-all-link">Full Health History →</router-link>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- 
      CONSULTATION REQUEST MODAL 
      The primary entry point for patients to secure a time slot with a clinician.
    -->
    <Transition name="scale">
      <div v-if="showBookModal" class="modal-overlay" @click.self="showBookModal = false">
        <!-- Dialog surface with accessibility labels -->
        <div class="modal-window" role="dialog" aria-labelledby="modal-title">
          <h3 id="modal-title">Request Consultation</h3>
          <p class="modal-subtitle">Choose your preferred provider and time slot.</p>
          
          <form @submit.prevent="bookAppointment" class="modal-form">
            <div class="form-field">
              <label for="doc-select">Clinical Provider</label>
              <select id="doc-select" v-model="newAppointment.doctor" class="styled-select">
                <option v-for="doc in availableDoctors" :key="doc.id" :value="doc.name">
                  {{ doc.name }} ({{ doc.specialization || 'General Consultation' }})
                </option>
                <option v-if="availableDoctors.length === 0" disabled>No doctors available</option>
              </select>
            </div>

            <!-- Standardized inputs with built-in date/time pickers -->
            <BaseInput
              id="apt-date"
              v-model="newAppointment.date"
              label="Selected Date"
              type="date"
            />

            <BaseInput
              id="apt-time"
              v-model="newAppointment.time"
              label="Preferred Time"
              type="time"
            />

            <div class="modal-actions">
              <BaseButton variant="secondary" @click="showBookModal = false" type="button">Cancel</BaseButton>
              <BaseButton type="submit" variant="primary" :is-loading="isSubmitting">Request Booking</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- 
      HEALTH LOG MODAL 
      A focused interaction surface for capturing patient observations.
    -->
    <Transition name="scale">
      <div v-if="showRecordModal" class="modal-overlay" @click.self="showRecordModal = false">
        <div class="modal-window" role="dialog">
          <h3>Track Health Log</h3>
          <form @submit.prevent="addPersonalNote" class="modal-form">
            <BaseInput
              id="rec-title"
              v-model="newRecord.title"
              label="Subject / Metric"
              placeholder="e.g. Morning Blood Pressure"
            />
            
            <div class="form-field">
              <label for="rec-notes">Observations</label>
              <!-- Large textarea for descriptive personal notes -->
              <textarea 
                id="rec-notes" 
                v-model="newRecord.content" 
                class="styled-textarea" 
                rows="4" 
                placeholder="What did you notice today?"
              ></textarea>
            </div>

            <div class="modal-actions">
              <BaseButton variant="secondary" @click="showRecordModal = false" type="button">Discard</BaseButton>
              <BaseButton type="submit" variant="primary">Save Entry</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </DashboardLayout>
</template>

<style scoped>
/* Top row stats grid styling */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem; /* Tightened from 2.5rem */
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-faint);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid var(--glass-border);
}

.stat-label {
  color: var(--text-dim);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

/* Primary dashlet grid */
.patient-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem; /* Tightened from 2rem */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 { margin: 0; font-size: 1.25rem; }

/* DATA LISTS: List-style containers for high-density information */
.data-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem; /* Tightened from 1.25rem */
  background: var(--bg-faint);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  transition: all 0.2s ease;
}

.data-item:hover {
  background: var(--bg-pure);
  transform: translateX(4px);
  border-color: var(--primary-main);
}

/* Typography for list items */
.item-title { font-weight: 700; margin: 0 0 0.25rem; }
.item-sub { font-size: 0.85rem; color: var(--text-dim); }

.empty-placeholder {
  text-align: center;
  padding: 3rem;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.2;
}

/* RECORD CARDS: Sub-summary style for long-form note previews */
.record-summary-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-summary-item {
  padding: 1rem;
  background: var(--bg-faint, #f8fafc);
  border-radius: 12px;
  border: 1px solid var(--bg-muted);
}

.record-summary-item h4 { margin: 0.25rem 0; font-size: 1rem; }
.record-summary-item p { color: var(--text-dim); font-size: 0.85rem; margin: 0; }
.record-summary-item .record-date { font-size: 0.75rem; font-weight: 700; color: var(--primary-main); }

.card-action-footer {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bg-muted, #f1f5f9);
  text-align: center;
}

.view-all-link {
  color: var(--primary-main, #6366f1);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
}

.view-all-link:hover { text-decoration: underline; }

/* MODALS: Standard centered focused interaction surfaces */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1.5rem;
}

.modal-window {
  background: var(--bg-pure);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
}

.modal-window h3 { font-size: 1.5rem; margin: 0 0 0.5rem; }

.modal-subtitle {
  color: var(--text-dim);
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-dim);
  margin-left: 4px;
}

/* Styled interactive elements for health entries */
.styled-select, .styled-textarea {
  background: var(--bg-faint);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  color: var(--text-main);
  width: 100%;
  outline: none;
  font-family: inherit;
}

.styled-select:focus, .styled-textarea:focus { border-color: var(--primary-main); }

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

/* Standard clinical scale-in animation */
.scale-enter-active, .scale-leave-active { transition: all 0.3s ease; }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9); }

/* Stack for mobile displays */
@media (max-width: 900px) {
  .patient-grid { grid-template-columns: 1fr; }
}
</style>
