<script setup>
/**
 * DOCTOR PATIENT QUEUE
 * Advanced interface for managing active patient consultations and diagnostic records.
 * Provides real-time queue management and historical note retrieval for physicians.
 */
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useRecordStore } from '../../stores/recordStore'
import { useAuthStore } from '../../stores/authStore'

// Access system-wide stores for scheduling and clinical visibility.
const appointmentStore = useAppointmentStore()
const recordStore = useRecordStore()
const authStore = useAuthStore()

// --- UI STATE ---
// Reactive flag to control the consultation/note entry modal visibility.
const showNoteModal = ref(false)
// Distinguishes between creating a new note and updating an existing one.
const isEditing = ref(false)
// Tracks the specific appointment context for the active clinical session.
const activeApt = ref(null)
// Stores the specific record ID when performing an update.
const editingNoteId = ref(null)
// Accumulator for clinical observations and findings during the exam.
const notesContent = ref('')
// Tracks submission state to manage button loading indicators.
const isSubmitting = ref(false)

// --- DATA DERIVATION ---
/**
 * myQueue - Computed list of active consultations for the physician.
 * Filters out cancelled interactions to maintain a focused clinical workflow.
 */
const myQueue = computed(() => appointmentStore.doctorAppointments.filter(a => a.status !== 'cancelled'))

/**
 * patientRecords - Security-aware retrieval of clinical history.
 * Fetches authorized records pertaining specifically to the patient in the active appointment.
 */
const patientRecords = computed(() => {
  if (!activeApt.value) return []
  return recordStore.authorizedRecords.filter(r => r.patientId === activeApt.value.id || r.userId === activeApt.value.patientId)
})

// --- ACTIONS ---

/**
 * startConsultation - Transitions the UI into 'Active Diagnosis' mode.
 * Loads the appointment context and opens the clinical note interface.
 */
const startConsultation = (apt) => {
  activeApt.value = apt
  isEditing.value = false
  notesContent.value = ''
  showNoteModal.value = true
}

/**
 * openEditNote - Enters 'Update Mode' for a previous consultation record.
 * Populates the UI buffer with existing clinical findings for revision.
 */
const openEditNote = (record) => {
  editingNoteId.value = record.id
  notesContent.value = record.content
  isEditing.value = true
  showNoteModal.value = true
}

/**
 * saveConsultation - Persists clinical findings to the permanent registry.
 * Handles both the creation of new consultation notes and updates to existing history.
 * On creation, it also triggers a status update for the parent appointment.
 */
const saveConsultation = () => {
  if (!notesContent.value) return
  isSubmitting.value = true
  
  // Simulated processing delay for operational feedback.
  setTimeout(() => {
    if (isEditing.value) {
      // 1a. UPDATE: Modify an existing record in the clinical database.
      recordStore.updateRecord(editingNoteId.value, { content: notesContent.value })
    } else {
      // 1b. CREATE: Record new diagnostic findings.
      recordStore.addRecord({
        title: `Clinical Note: ${activeApt.value.patientName}`,
        content: notesContent.value,
        patientId: activeApt.value.id, // Primary key reference
        patientName: activeApt.value.patientName,
        issuer: authStore.currentUser.name,
        type: 'consultation'
      })
      // 2. LIFECYCLE: Automatically mark the appointment as completed upon saving notes.
      appointmentStore.updateStatus(activeApt.value.id, 'completed')
    }
    
    // UI Cleanup once operations are saved.
    closeModal()
    isSubmitting.value = false
  }, 600)
}

/**
 * deleteNote - Permanent removal of clinical record data.
 * Requires explicit user confirmation due to its destructive nature.
 */
const deleteNote = (id) => {
  if (confirm('Are you sure you want to delete this clinical note? This action is permanent.')) {
    recordStore.deleteRecord(id)
  }
}

/**
 * closeModal - Resets all local form buffers and hides the modal.
 */
const closeModal = () => {
  showNoteModal.value = false
  activeApt.value = null
  editingNoteId.value = null
  notesContent.value = ''
}
</script>

<template>
  <DashboardLayout>
    <template #header-title>Patient Queue</template>

    <div class="queue-container">
      <!-- 
        ACTIVE CONSULTATIONS 
        Primary table for managing the day's incoming medical traffic.
      -->
      <BaseCard title="Active Consultations">
        <template #header>
          <div class="card-header">
            <div>
              <h2>Daily Patient Queue</h2>
              <p class="subtitle">Manage patient arrivals and record diagnostic findings.</p>
            </div>
          </div>
        </template>

        <!-- Empty State UI -->
        <div v-if="myQueue.length === 0" class="empty-state">
          <svg class="empty-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p>No patients currently in your queue.</p>
        </div>

        <!-- Clinical Queue Table -->
        <div v-else class="table-wrapper">
          <table class="clinical-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Appt. Time</th>
                <th>Status</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="apt in myQueue" :key="apt.id" :class="{ 'completed': apt.status === 'completed' }">
                <td>
                  <div class="patient-cell">
                    <div class="avatar">{{ apt.patientName[0] }}</div>
                    <div class="p-info">
                      <span class="p-name">{{ apt.patientName }}</span>
                      <span class="p-id">ID: #{{ apt.id.toString().slice(-4) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="time-badge">{{ apt.time }}</span>
                </td>
                <td>
                  <span :class="['status-pill', apt.status]">{{ apt.status }}</span>
                </td>
                <td class="text-right">
                  <!-- Context-aware actions based on clinical status -->
                  <BaseButton 
                    v-if="apt.status === 'approved'" 
                    @click="startConsultation(apt)" 
                    variant="primary" 
                    size="sm"
                  >
                    Start Diagnosis
                  </BaseButton>
                  <BaseButton 
                    v-else-if="apt.status === 'pending'" 
                    @click="appointmentStore.updateStatus(apt.id, 'approved')" 
                    variant="outline" 
                    size="sm"
                  >
                    Approve
                  </BaseButton>
                  <span v-else class="done-label">✓ Recorded</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseCard>

      <!-- 
        RECORDS MANAGEMENT 
        Secondary grid displaying specific consultation history for revision.
      -->
      <BaseCard class="records-mgmt-card">
        <template #header>
          <div class="card-header">
            <h2>Recent Clinical Notes</h2>
            <p class="subtitle">Manage and update your patient consultation history.</p>
          </div>
        </template>
        
        <div class="notes-grid">
          <!-- Filtered display of doctor's own issued consultation notes -->
          <div v-for="record in recordStore.authorizedRecords.filter(r => r.type === 'consultation')" :key="record.id" class="note-item">
            <div class="note-header">
              <span class="note-date">{{ record.date }}</span>
              <div class="note-actions">
                <button @click="openEditNote(record)" class="btn-edit" aria-label="Edit Note">
                  <span aria-hidden="true">✏️</span>
                </button>
                <button @click="deleteNote(record.id)" class="btn-delete" aria-label="Delete Note">
                  <span aria-hidden="true">🗑️</span>
                </button>
              </div>
            </div>
            <h4 class="note-patient">{{ record.patientName }}</h4>
            <p class="note-text">{{ record.content }}</p>
          </div>
          
          <!-- Fallback if no records have been saved yet -->
          <div v-if="recordStore.authorizedRecords.filter(r => r.type === 'consultation').length === 0" class="empty-notes">
            <p>No consultation records found in the system yet.</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- CONSULTATION MODAL: Focus area for diagnosis and record keeping -->
    <Transition name="fade">
      <div v-if="showNoteModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <div>
              <h3>{{ isEditing ? 'Edit Clinical Note' : 'New Consultation Record' }}</h3>
              <p v-if="activeApt">Patient: <strong>{{ activeApt.patientName }}</strong></p>
            </div>
            <button class="close-btn" @click="closeModal">✕</button>
          </div>
          
          <div class="modal-body">
            <div class="form-field">
              <label>Findings, Diagnosis & Treatment Plan</label>
              <!-- Primary text area for medical recording -->
              <textarea 
                v-model="notesContent" 
                class="clinical-textarea" 
                placeholder="Enter detailed clinical observations..."
                rows="10"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <BaseButton variant="ghost" @click="closeModal" type="button">Discard</BaseButton>
            <BaseButton @click="saveConsultation" variant="primary" :is-loading="isSubmitting">
              {{ isEditing ? 'Update Record' : 'Save & Complete' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </DashboardLayout>
</template>

<style scoped>
/* Main responsive container constrained for clinical focused workflows */
.queue-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtitle {
  color: var(--text-dim, #94a3b8);
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: var(--text-dim);
}

.empty-svg {
  width: 48px;
  height: 48px;
  display: block;
  margin: 0 auto 1.25rem;
  color: var(--text-dim);
  opacity: 0.15;
}

.table-wrapper {
  overflow-x: auto;
}

/* TABLE STYLING: Standard clinical row layout with status indicators */
.clinical-table {
  width: 100%;
  border-collapse: collapse;
}

.clinical-table th {
  text-align: left;
  padding: 1rem;
  background: var(--bg-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-dim);
  border-bottom: 2px solid var(--glass-border);
}

.clinical-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--bg-muted);
}

/* Reduced prominence for already finalized consultations */
.clinical-table tr.completed {
  opacity: 0.6;
}

.patient-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 40px;
  height: 40px;
  background: var(--primary-light, #e0f2fe);
  color: var(--primary-main, #0284c7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.1rem;
}

.p-name { display: block; font-weight: 700; color: var(--text-main); }
.p-id { font-size: 0.75rem; color: var(--text-dim); }

.time-badge {
  background: var(--bg-faint);
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-main);
  border: 1px solid var(--bg-muted);
}

/* Status pills for instant visual triage */
.status-pill {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  text-transform: uppercase;
}

.status-pill.pending { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.status-pill.approved { background: rgba(59, 130, 246, 0.15); color: var(--primary-dark); }
.status-pill.completed { background: rgba(16, 185, 129, 0.15); color: #047857; }
.status-pill.cancelled { background: rgba(239, 68, 68, 0.15); color: #b91c1c; }
.text-right { text-align: right; }
.done-label { color: #10b981; font-weight: 700; font-size: 0.85rem; }

/* NOTES GRID: Card-based history visualization */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.note-item {
  background: var(--bg-faint);
  border: 1px solid var(--bg-muted);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s;
}

.note-item:hover {
  border-color: var(--primary-main);
  background: var(--bg-pure);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.note-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.note-date { font-size: 0.75rem; font-weight: 800; color: var(--primary-main); opacity: 0.8; }
.note-patient { margin: 0 0 0.5rem; font-size: 1.1rem; }
.note-text { 
  font-size: 0.9rem; 
  color: var(--text-dim); 
  line-height: 1.6; 
  display: -webkit-box; 
  -webkit-line-clamp: 3; 
  line-clamp: 3;
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}

/* Minimal utility actions for record maintenance */
.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.btn-edit:hover, .btn-delete:hover { opacity: 1; }
.btn-delete:hover { color: #ef4444; }

.empty-notes { grid-column: 1 / -1; text-align: center; color: var(--text-dim); padding: 2rem; }

/* MODAL: Standard centered surgical surface */
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
  max-width: 650px;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--bg-muted);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; }
.modal-header p { margin: 0.25rem 0 0; color: var(--text-dim); font-size: 0.9rem; }

.modal-body { padding: 2rem; }
.form-field { display: flex; flex-direction: column; gap: 0.75rem; }
.form-field label { font-weight: 700; font-size: 0.9rem; color: var(--text-dim); }

/* Standard therapeutic-blue styled textarea for physicians */
.clinical-textarea {
  width: 100%;
  padding: 1.25rem;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  background: var(--bg-faint);
  color: var(--text-main);
  outline: none;
  resize: vertical;
}

.clinical-textarea:focus {
  border-color: var(--primary-main);
  background: var(--bg-pure);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--bg-muted);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Smooth opacity transition for focused modal entry */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
