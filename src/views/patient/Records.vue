<script setup>
/**
 * PATIENT HEALTH RECORDS VIEW
 * Provides a comprehensive, chronological timeline of all health data associated with the patient identity.
 * Displays both professional 'Consultation' records (issued by doctors) and 'Personal' health logs.
 */
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import BaseInput from '../../components/forms/BaseInput.vue'
import { useRecordStore } from '../../stores/recordStore'
import { useAuthStore } from '../../stores/authStore'

// Initialize clinical record and identity stores.
const recordStore = useRecordStore()
const authStore = useAuthStore()

// --- UI STATE ---
// Reactive flag to toggle the 'Add Personal Note' interaction surface.
const showModal = ref(false)
// Manages button states during persistent operations.
const isSubmitting = ref(false)

// --- DATA DERIVATION ---
/**
 * myRecords - Computed timeline of authorized health events.
 * Sorting logic: Strictly chronological, newest entries appearing at the top.
 */
const myRecords = computed(() => {
  return recordStore.authorizedRecords
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

// --- FORM DATA ---
// Reactive buffer for capturing manual health updates.
const form = ref({
  title: '',
  content: '',
  type: 'personal' // Clinical types are reserved for professional staff only.
})

/**
 * addRecord - Persists a new personal observation to the patient's timeline.
 */
const addRecord = async () => {
  if (!form.value.title || !form.value.content) return
  
  isSubmitting.value = true
  
  // Simulated processing latency for operational feedback.
  setTimeout(() => {
    // 1. PERSISTENCE: Record the health log in the clinical registry.
    recordStore.addRecord({
      ...form.value,
      userId: authStore.currentUser.id
    })
    
    // 2. CLEANUP: Reset the local buffer and transition the UI.
    form.value = { title: '', content: '', type: 'personal' }
    isSubmitting.value = false
    showModal.value = false
  }, 500)
}

/**
 * deleteRecord - Irreversible removal of a health log entry.
 * Protected by explicit user confirmation.
 */
const deleteRecord = (id) => {
  if (confirm('Permanently delete this record?')) {
    recordStore.deleteRecord(id)
  }
}
</script>

<template>
  <DashboardLayout>
    <!-- Slot override for the master title in the layout shell -->
    <template #header-title>Health Records</template>

    <div class="records-container">
      <!-- 
        PAGE HEADER 
        Contextual header with primary action for record creation.
      -->
      <div class="records-header">
        <div class="header-info">
          <h2>Health Timeline</h2>
          <p>Your complete clinical history and personal health logs.</p>
        </div>
        <BaseButton @click="showModal = true" variant="primary">
          + Add Personal Note
        </BaseButton>
      </div>

      <!-- 
        TIMELINE COMPONENT 
        A vertical stream of interactive record cards.
      -->
      <div class="timeline">
        <!-- Empty State UI: Displayed for new users with no clinical history -->
        <div v-if="myRecords.length === 0" class="empty-records">
          <svg class="empty-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <h4>No records available yet</h4>
          <p>This is where your medical history and health logs will appear. Start by adding a personal note.</p>
          <BaseButton variant="ghost" @click="showModal = true">Log My First Health Note</BaseButton>
        </div>

        <!-- Iterates through record objects to render the vertical timeline -->
        <div v-for="record in myRecords" :key="record.id" class="timeline-item">
          <!-- VISUAL MARKER: Colored dot and vertical connecting line -->
          <div class="timeline-marker">
            <div class="marker-circle" :class="record.type"></div>
            <div class="marker-line"></div>
          </div>
          
          <div class="record-card-wrapper">
            <!-- Precise entry timestamp -->
            <div class="record-date">{{ record.date }}</div>
            <!-- CORE RECORD CARD: Type-specific styling for instant recognition -->
            <BaseCard class="record-card" :class="record.type">
              <div class="record-top">
                <!-- Data Source Indicator: Clinical (Doctor-issued) vs Personal (Self-recorded) -->
                <div class="record-type-badge" :class="record.type">
                  <span aria-hidden="true">{{ record.type === 'consultation' ? '🩺' : '📝' }}</span>
                  {{ record.type === 'consultation' ? ' Clinical' : ' Personal' }}
                </div>
                <div class="record-actions">
                  <!-- Entry deletion control -->
                  <button @click="deleteRecord(record.id)" class="btn-delete" aria-label="Delete record">
                    <span aria-hidden="true">🗑️</span>
                  </button>
                </div>
              </div>
              <h4 class="record-title">{{ record.title }}</h4>
              <p class="record-content">{{ record.content }}</p>
            </BaseCard>
          </div>
        </div>
      </div>
    </div>

    <!-- 
      POSTING MODAL: Standard interaction surface for manual health logging 
    -->
    <Transition name="fade">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Add Health Log</h3>
            <button class="close-btn" @click="showModal = false" aria-label="Close modal">✕</button>
          </div>
          
          <form @submit.prevent="addRecord" class="modal-form">
            <!-- Metric/Subject Capture -->
            <BaseInput
              id="record-subject"
              v-model="form.title"
              label="Subject/Metric"
              placeholder="e.g. Blood Pressure, Wellness Check-in"
              required
            />

            <!-- Narrative/Clinical Detail Capture -->
            <div class="form-group">
              <label for="p-findings">Observations</label>
              <textarea 
                id="p-findings"
                v-model="form.content" 
                class="styled-textarea" 
                placeholder="Write down your symptoms, concerns or health notes..."
                rows="5"
                required
              ></textarea>
            </div>

            <!-- Form Submission Controls -->
            <div class="modal-footer">
              <BaseButton type="button" variant="ghost" @click="showModal = false">Discard</BaseButton>
              <BaseButton type="submit" variant="primary" :is-loading="isSubmitting">
                Save Entry
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </DashboardLayout>
</template>

<style scoped>
/* Timeline container sizing for optimal vertical flow */
.records-container {
  max-width: 800px;
  margin: 0 auto;
}

.records-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem; /* Tightened from 3rem */
}

.records-header h3 { margin: 0; font-size: 1.5rem; }
.records-header p { color: var(--text-dim); margin-top: 0.25rem; }

.timeline {
  position: relative;
  padding-bottom: 2rem;
}

.empty-records {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-svg {
  width: 54px;
  height: 54px;
  display: block;
  margin: 0 auto 1.5rem;
  color: var(--text-dim);
  opacity: 0.15;
}

/* TIMELINE GEOMETRY: Vertical alignment of markers and cards */
.timeline-item {
  display: flex;
  gap: 1.5rem; /* Tightened from 2rem */
  margin-bottom: 2.5rem;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
}

.marker-circle {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--bg-pure);
  border: 3px solid var(--primary-main);
  z-index: 1;
}

/* Color codes synchronized with the clinical/personal distinction */
.marker-circle.personal { border-color: #4f46e5; }
.marker-circle.consultation { border-color: #059669; }

.marker-line {
  flex: 1;
  width: 2px;
  background: var(--bg-muted, #f1f5f9);
  margin-top: -2px;
}

/* Hide the connecting line for the final historical event */
.timeline-item:last-child .marker-line {
  display: none;
}

.record-card-wrapper {
  flex: 1;
  margin-top: -4px;
}

.record-date {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dim);
  margin-bottom: 0.75rem;
}

/* Secondary border identifiers on record cards */
.record-card {
  border-left: 4px solid var(--bg-muted);
}

.record-card.personal { border-left-color: #4f46e5; }
.record-card.consultation { border-left-color: #059669; }

.record-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

/* Contrast-compliant source badges */
.record-type-badge {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.record-type-badge.personal { background: rgba(99, 102, 241, 0.1); color: #4f46e5; }
.record-type-badge.consultation { background: rgba(16, 185, 129, 0.1); color: #059669; }

.record-title {
  font-size: 1.15rem;
  margin: 0 0 0.5rem;
}

.record-content {
  color: var(--text-dim);
  line-height: 1.6;
  margin: 0;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.4;
  transition: opacity 0.2s;
  padding: 4px;
}

.btn-delete:hover { opacity: 1; color: #ef4444; }

/* MODAL: focused therapeutic interaction surface */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, 0.7);
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

.modal-form {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Tightened from 1.5rem */
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
}

/* Standardized textarea for narrative health logging */
.styled-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-size: 0.95rem;
  outline: none;
  background: var(--bg-faint);
  color: var(--text-main);
  font-family: inherit;
  transition: all 0.2s;
  resize: vertical;
}

.styled-textarea:focus {
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

/* Transitions for modal lifecycle */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
