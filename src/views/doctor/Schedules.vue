<script setup>
/**
 * DOCTOR SCHEDULES VIEW
 * Provides a comprehensive, chronological timeline of all patient appointments.
 * It functions as a clinical calendar for physicians to monitor their upcoming workload.
 */
import { ref, computed } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'

// Access the global appointment store to retrieve provider-specific data.
const appointmentStore = useAppointmentStore()

// --- DATA DERIVATION ---
/**
 * myAppointments - A computed, sorted list of all appointments for the logged-in doctor.
 * Sorting logic: Primary sort by Date (ascending), Secondary sort by Time (ascending).
 */
const myAppointments = computed(() => {
  return appointmentStore.doctorAppointments
    .slice()
    .sort((a, b) => {
      // Concatenate ISO date and time for robust comparison.
      const dateA = new Date(a.date + 'T' + a.time)
      const dateB = new Date(b.date + 'T' + b.time)
      return dateA - dateB
    })
})

/**
 * upcomingCount - Aggregates the total number of approved or pending interactions.
 * Helps the provider gauge their remaining load for the day/period.
 */
const upcomingCount = computed(() => myAppointments.value.filter(a => a.status === 'approved' || a.status === 'pending').length)
</script>

<template>
  <DashboardLayout>
    <!-- View Header: Title defined for the dashboard layout shell -->
    <template #header-title>Provider Schedules</template>

    <div class="schedules-container">
      <!-- 
        SECTION HEADER 
        Displays contextual info and the 'Upcoming' counter widget.
      -->
      <div class="schedules-header">
        <div class="header-info">
          <h3>Schedules & Appointments</h3>
          <p>Chronological view of your clinical bookings.</p>
        </div>
        <div class="header-stats">
          <!-- Quick stats pill for immediate provider awareness -->
          <div class="stat-pill">
            <span class="stat-label">Upcoming:</span>
            <span class="stat-value">{{ upcomingCount }}</span>
          </div>
        </div>
      </div>

      <!-- 
        APPOINTMENTS TIMELINE 
        A structured list of cards, each representing a clinical session.
      -->
      <div class="appointments-timeline">
        <!-- Empty State Fallback: Renders when the physician has no scheduled entries -->
        <div v-if="myAppointments.length === 0" class="empty-schedules">
          <span class="empty-icon">⏰</span>
          <h4>Calendar is Clear</h4>
          <p>You have no scheduled appointments at the moment.</p>
        </div>

        <!-- Loop through sorted appointments and render timeline items -->
        <div v-for="apt in myAppointments" :key="apt.id" class="calendar-item" :class="apt.status">
          <!-- DATE BOX: Floating identity for the entry date -->
          <div class="item-date-box">
            <!-- Extracting day number and month from the ISO string -->
            <span class="date">{{ apt.date.split('-')[2] }}</span>
            <span class="month">{{ new Date(apt.date).toLocaleString('default', { month: 'short' }).toUpperCase() }}</span>
          </div>
          
          <!-- BODY CARD: Secondary container for clinical interaction details -->
          <BaseCard class="item-body" :class="apt.status">
            <div class="item-main">
              <div class="item-info">
                <!-- Session Context: Time, Patient Name, and Reason for Visit -->
                <span class="item-time">⏰ {{ apt.time }}</span>
                <h4 class="item-patient">{{ apt.patientName }}</h4>
                <p v-if="apt.reason" class="item-reason">{{ apt.reason }}</p>
                <p v-else class="item-reason-placeholder">General Consultation</p>
              </div>
              
              <!-- STATUS PILL: Visual indicator of current lifecycle stage (Pending, Approved, etc.) -->
              <div class="item-status">
                <span :class="['status-pill', apt.status]">{{ apt.status }}</span>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Main container layout constraints */
.schedules-container {
  max-width: 900px;
  margin: 0 auto;
}

.schedules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem; /* Tightened from 3rem */
}

.header-info h3 { margin: 0; font-size: 1.5rem; }
.header-info p { margin: 0.25rem 0 0; color: var(--text-dim); }

/* Quick info pill for high-level metrics */
.stat-pill {
  background: var(--bg-pure);
  padding: 0.5rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  font-weight: 700;
  display: flex;
  gap: 0.5rem;
  box-shadow: var(--shadow-sm);
}

.stat-label { color: var(--text-dim); font-size: 0.85rem; font-weight: 700; }
.stat-value { color: var(--primary-main); font-weight: 800; }

.appointments-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* Tightened from 1.5rem */
  position: relative;
}

.empty-schedules {
  text-align: center;
  padding: 5rem;
  color: var(--text-dim);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  opacity: 0.2;
}

/* Timeline Item Layout: Date component alongside the detail card */
.calendar-item {
  display: flex;
  gap: 1.5rem; /* Tightened from 2rem */
  align-items: stretch;
}

.item-date-box {
  width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-pure);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}

.date { font-size: 1.5rem; font-weight: 800; color: var(--text-main); line-height: 1; }
.month { font-size: 0.75rem; font-weight: 800; color: var(--primary-main); letter-spacing: 0.05em; }

.item-body {
  flex: 1;
  padding: 1rem !important; /* Tightened from 1.25rem */
}

.item-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-time {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--primary-main);
  margin-bottom: 0.25rem;
}

.item-patient {
  margin: 0 0 0.25rem;
  font-size: 1.15rem;
}

.item-reason {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-dim);
  font-style: italic;
  font-weight: 600;
}

.item-reason-placeholder {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-dim);
  opacity: 0.5;
}

/* Status-aware color tokens for standard indicators */
.status-pill {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.35rem 0.75rem;
  border-radius: 99px;
  text-transform: uppercase;
}

.status-pill.pending { background: rgba(234, 179, 8, 0.1); color: #d97706; }
.status-pill.approved { background: rgba(59, 130, 246, 0.1); color: var(--primary-main); }
.status-pill.completed { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-pill.cancelled { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

/* Visual vertical borders to further differentiate appointment status at a glance */
.item-body.completed { border-left: 4px solid #10b981; }
.item-body.approved { border-left: 4px solid #3b82f6; }
.item-body.pending { border-left: 4px solid #eab308; }
.item-body.cancelled { border-left: 4px solid #ef4444; opacity: 0.6; }

/* Mobile optimization: Collapse timeline into a single vertical stack */
@media (max-width: 600px) {
  .calendar-item { flex-direction: column; gap: 1rem; }
  .item-date-box { width: 100%; flex-direction: row; gap: 0.5rem; padding: 0.5rem; }
}
</style>
