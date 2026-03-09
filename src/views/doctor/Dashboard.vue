<script setup>
/**
 * DOCTOR DASHBOARD
 * This is the primary interface for clinical providers to manage their daily interactions.
 * It provides high-level telemetry on patient traffic and immediate access to the active queue.
 */
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useRecordStore } from '../../stores/recordStore'
import { useAuthStore } from '../../stores/authStore'

// Initialize clinical and identity stores.
const appointmentStore = useAppointmentStore()
const recordStore = useRecordStore()
const authStore = useAuthStore()

// --- UI STATE ---
// Reactive flag to toggle the diagnosis entry modal.
const showDiagnosisForm = ref(false)
// Stores the specific appointment currently being processed in a clinical session.
const activeApt = ref(null)
// Buffer for clinical findings and diagnostic notes during an examination.
const clinicalNotes = ref('')
// Tracks submission state to manage button loading effects.
const isSubmitting = ref(false)

// --- DATA DERIVATION ---
/**
 * myPatientQueue - Computed list of appointments assigned to the logged-in doctor.
 * Pulls directly from the global appointment store.
 */
const myPatientQueue = computed(() => appointmentStore.doctorAppointments)

/**
 * startDiagnosis - Prepares the UI for a clinical consultation.
 * Sets the active appointment and opens the diagnostic entry form.
 */
const startDiagnosis = (apt) => {
  activeApt.value = apt
  showDiagnosisForm.value = true
}

/**
 * completeSession - Finalizes a clinical consultation.
 * This function handles two critical clinical operations:
 * 1. Permanently records diagnostic findings in the Medical Record store.
 * 2. Marks the system appointment as 'completed' to clear the queue.
 */
const completeSession = () => {
  // Guard: Ensure clinical observations are not empty before persistence.
  if (!clinicalNotes.value) return
  
  isSubmitting.value = true
  const selectedApt = activeApt.value
  
  // Simulated processing delay to allow the user to see the operational cycle.
  setTimeout(() => {
    // 1. CRITICAL: Create a permanent clinical record in the registry.
    recordStore.addRecord({
      title: `Consultation: ${selectedApt.patientName}`,
      content: clinicalNotes.value,
      patientId: selectedApt.id,
      issuer: authStore.currentUser.name, // Log which doctor issued the record.
      type: 'official'
    })
    
    // 2. LIFECYCLE: Update the appointment status to remove it from the active queue.
    appointmentStore.updateStatus(selectedApt.id, 'completed')
    
    // 3. CLEANUP: Reset the local UI buffer once persistent operations succeed.
    clinicalNotes.value = ''
    showDiagnosisForm.value = false
    isSubmitting.value = false
    activeApt.value = null
  }, 1000)
}

/**
 * stats - Computed telemetry summary for the top-row widgets.
 * Aggregates clinical traffic data for immediate provider awareness.
 */
const stats = computed(() => {
  const all = myPatientQueue.value
  return [
    { label: 'Total Patients', value: all.length, color: 'var(--primary-main)' },
    { label: 'Pending', value: all.filter(a => a.status === 'pending').length, color: '#b45309' },
    { label: 'Completed Today', value: all.filter(a => a.status === 'completed').length, color: '#047857' }
  ]
})
</script>

<template>
  <!-- Standard structural shell for role-based navigation -->
  <DashboardLayout>
    <template #header-title>Clinical Provider Dashboard</template>

    <!-- 
      PROVIDER QUICK SUMMARY 
      Hero metrics representing today's clinical load.
    -->
    <div class="stats-row">
      <BaseCard v-for="stat in stats" :key="stat.label" class="stat-box">
        <p class="stat-label">{{ stat.label }}</p>
        <span class="stat-number" :style="{ color: stat.color }">{{ stat.value }}</span>
      </BaseCard>
    </div>

    <!-- 
      PATIENT QUEUE OVERVIEW 
      A preview of active patients scheduled for consultation today.
    -->
    <BaseCard title="Patient Queue Management" class="queue-card">
      <template #header>
        <div class="card-header">
          <div class="header-info">
            <h3>Active Queue</h3>
            <p>Manage today's clinical schedules and diagnosis records.</p>
          </div>
          <BaseButton variant="secondary" size="sm">Refresh Data</BaseButton>
        </div>
      </template>

      <!-- Empty state: No patients currently waiting in the clinic queue -->
      <div v-if="myPatientQueue.length === 0" class="empty-placeholder">
        <svg class="empty-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
        <p>Your queue is empty. Relax and verify your schedule later.</p>
      </div>

      <!-- Preview list of the first 4 active interactions -->
      <div v-else class="summary-list">
        <div v-for="apt in myPatientQueue.slice(0, 4)" :key="apt.id" class="summary-item" :class="{ 'completed-row': apt.status === 'completed' }">
          <div class="patient-info">
            <!-- Small circular avatar for quick identity recognition -->
            <div class="avatar-small" aria-hidden="true">{{ apt.patientName[0] }}</div>
            <div class="p-details">
              <span class="name">{{ apt.patientName }}</span>
              <span class="time">{{ apt.date }} • {{ apt.time }}</span>
            </div>
          </div>
          <!-- Colored pill indicator for clinical status -->
          <div class="status-box">
            <span :class="['status-pill', apt.status]">{{ apt.status }}</span>
          </div>
        </div>
        
        <!-- Navigation to complete clinical management portals -->
        <div class="card-action-footer">
          <router-link to="/doctor/queue" class="view-all-link">Manage Active Queue →</router-link>
          <router-link to="/doctor/schedules" class="view-all-link secondary">View Full Schedule →</router-link>
        </div>
      </div>
    </BaseCard>

    <!-- 
      CLINICAL EXAMINATION (DIAGNOSIS MODAL) 
      Used during active consultations to capture physician observations.
    -->
    <Transition name="fade">
      <div v-if="showDiagnosisForm" class="modal-overlay" @click.self="showDiagnosisForm = false">
        <!-- Surface containing the diagnosis entry form -->
        <div class="modal-surface" role="dialog">
          <div class="modal-header">
            <h3>Clinical Examination</h3>
            <p>Entering diagnosis for <strong>{{ activeApt?.patientName }}</strong></p>
          </div>

          <form @submit.prevent="completeSession">
            <div class="field">
              <label for="diagnosis">Medical Findings & Observations</label>
              <!-- Large clinical text entry area -->
              <textarea 
                id="diagnosis"
                v-model="clinicalNotes" 
                rows="8" 
                class="clinical-textarea"
                placeholder="Describe clinical findings, prescriptions, and recommended follow-up..."
                required
              ></textarea>
            </div>

            <!-- Form submission controls -->
            <div class="modal-footer">
              <BaseButton variant="ghost" @click="showDiagnosisForm = false" type="button">Discard</BaseButton>
              <BaseButton type="submit" variant="primary" :is-loading="isSubmitting">
                Complete Consultation
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </DashboardLayout>
</template>

<style scoped>
/* High-level grid for summary widgets */
.stats-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-box {
  flex: 1;
  padding: 1.5rem 2rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
}

.queue-card {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h3 { margin: 0; }
.header-info p {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-top: 0.25rem;
}

/* Row-based list for patient queue items */
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--bg-faint, #f8fafc);
  border-radius: 12px;
  border: 1px solid var(--bg-muted);
}

/* Reduced opacity for already processed interactions */
.completed-row {
  opacity: 0.6;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-small {
  width: 32px;
  height: 32px;
  background: var(--glass, rgba(255, 255, 255, 0.05));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--primary-main, #6366f1);
}

.name {
  font-weight: 700;
}

.p-details {
  display: flex;
  flex-direction: column;
}

.p-details .time {
  font-size: 0.8rem;
  color: var(--text-dim);
}

/* Standardized status pill indicators */
.status-pill {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-pill.pending { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.status-pill.approved { background: rgba(59, 130, 246, 0.15); color: var(--primary-dark); }
.status-pill.completed { background: rgba(16, 185, 129, 0.15); color: #047857; }

/* Empty state styling */
.empty-placeholder {
  padding: 5rem;
  text-align: center;
  color: var(--text-dim);
}

.empty-svg {
  width: 54px;
  height: 54px;
  display: block;
  margin: 0 auto 1.5rem;
  color: var(--text-dim);
  opacity: 0.15;
}

.card-action-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bg-muted);
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.view-all-link {
  color: var(--primary-main, #6366f1);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
}

.view-all-link:hover { text-decoration: underline; }
.view-all-link.secondary { color: var(--text-dim); }

/* DIAGNOSIS MODAL: Professional clinical surface for recording notes */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-surface {
  background: var(--bg-pure);
  border: 1px solid var(--glass-border);
  border-radius: 28px;
  width: 100%;
  max-width: 600px;
  padding: 3rem;
  box-shadow: var(--shadow-lg);
}

.modal-header h3 { font-size: 1.5rem; margin: 0; }
.modal-header p { color: var(--text-dim); margin-top: 0.5rem; }

.field { margin: 2rem 0; display: flex; flex-direction: column; gap: 0.75rem; }
.field label { font-size: 0.9rem; font-weight: 700; color: var(--text-dim); }

/* Optimized clinical textarea for large-form notes */
.clinical-textarea {
  background: var(--bg-faint);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1.5rem;
  color: var(--text-main);
  width: 100%;
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  outline: none;
}

.clinical-textarea:focus {
  border-color: var(--primary-main);
  background: var(--bg-pure);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
}

/* Standard fade animation for modal entry */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
