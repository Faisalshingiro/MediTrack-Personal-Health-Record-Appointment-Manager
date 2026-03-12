<script setup>
/**
 * ADMIN DASHBOARD (OVERVIEW)
 * High-level system telemetry and control center for Administrators.
 * This view aggregates data from multiple stores to provide real-time 
 * visibility into system identities and clinical traffic.
 */
import { computed } from 'vue'
import DashboardLayout from '../../components/layout/DashboardLayout.vue'
import BaseCard from '../../components/base/BaseCard.vue'
import { useAppointmentStore } from '../../stores/appointmentStore'
import { useRecordStore } from '../../stores/recordStore'
import { useAuthStore } from '../../stores/authStore'

// Instantiate stores to access system-wide clinical and identity state.
const appointmentStore = useAppointmentStore()
const recordStore = useRecordStore()
const authStore = useAuthStore()

/**
 * systemStats - Computed analytics array used to drive the hero cards.
 * Aggregates lengths and filtered counts from the global stores.
 */
const systemStats = computed(() => [
  { 
    label: 'Managed Identities', 
    value: authStore.allUsers.length, 
    icon: '👥', 
    color: '#4f46e5', 
    path: '/admin/users' 
  },
  { 
    label: 'Clinical Visits', 
    value: appointmentStore.appointments.length, 
    icon: '📅', 
    color: 'var(--stat-completed)', 
    path: '/admin/logs' 
  },
  { 
    label: 'Awaiting Approval', 
    value: appointmentStore.appointments.filter(a => a.status === 'pending').length, 
    icon: '⌛', 
    color: 'var(--stat-pending)', 
    path: '/admin/logs' 
  },
  { 
    label: 'Medical Records', 
    value: recordStore.records.length, 
    icon: '📜', 
    color: '#0284c7', 
    path: '/admin/logs' 
  }
])

/**
 * recentActivity - Computed list of the most recent system events.
 * Currently tracks the latest 5 appointments to monitor incoming traffic.
 */
const recentActivity = computed(() => {
  // Take a slice of the latest 5 appointments and reverse them for chronological view.
  return appointmentStore.appointments.slice(-5).reverse()
})
</script>

<template>
  <!-- Standard Dashboard Wrapper -->
  <DashboardLayout>
    <!-- Slot override for the page title in the header -->
    <template #header-title>System Control Center</template>

    <div class="admin-dashboard-container">
      <!-- 
        ANALYTICS GRID 
        Renders the top row of high-impact metric cards.
      -->
      <div class="analytics-grid">
        <BaseCard v-for="stat in systemStats" :key="stat.label" class="analytic-card">
          <router-link :to="stat.path" class="analytic-link">
            <div class="analytic-flex">
              <!-- Dynamically colored background for the icon container -->
              <div class="analytic-icon" :style="{ background: stat.color + '10', color: stat.color }">
                {{ stat.icon }}
              </div>
              <div class="analytic-info">
                <p class="analytic-label">{{ stat.label }}</p>
                <div class="analytic-value">{{ stat.value }}</div>
              </div>
            </div>
          </router-link>
        </BaseCard>
      </div>

      <div class="dashboard-main">
        <!-- 
          QUICK OVERVIEW GRID 
          Two-column layout containing administrative modules and traffic tracking.
        -->
        <div class="quick-overview-grid">
          <!-- OVERSIGHT MODULE: Navigation links to major admin sections -->
          <BaseCard title="Strategic Oversight">
            <template #header>
              <div class="card-header">
                <h2>Global Oversight</h2>
                <p class="subtitle">Quick access to core administrative modules.</p>
              </div>
            </template>
            
            <div class="action-links">
              <!-- Entry point for User & Access management -->
              <router-link to="/admin/users" class="action-item">
                <span class="action-icon user">🛡️</span>
                <div class="action-text">
                  <span class="action-title">Identity Registry</span>
                  <span class="action-desc">Manage doctors, patients and access rights.</span>
                </div>
                <span class="action-arrow">→</span>
              </router-link>

              <!-- Entry point for Clinical Traffic monitoring -->
              <router-link to="/admin/logs" class="action-item">
                <span class="action-icon log">📜</span>
                <div class="action-text">
                  <span class="action-title">System Audit Log</span>
                  <span class="action-desc">Monitor clinical traffic and system events.</span>
                </div>
                <span class="action-arrow">→</span>
              </router-link>
            </div>
          </BaseCard>

          <!-- TRAFFIC MONITOR: Real-time feed of clinician-patient interactions -->
          <BaseCard title="Traffic Monitor">
            <template #header>
              <div class="card-header">
                <h2>Recent Traffic</h2>
                <p class="subtitle">Latest scheduled clinical interactions.</p>
              </div>
            </template>

            <!-- Empty state fallback if no activity exists -->
            <div v-if="recentActivity.length === 0" class="empty-activity">
              <p>No recent activity detected.</p>
            </div>

            <!-- List of individual interaction records -->
            <div v-else class="traffic-list">
              <div v-for="apt in recentActivity" :key="apt.id" class="traffic-item">
                <!-- Status indicator dot (colored via CSS based on status) -->
                <div class="traffic-marker" :class="apt.status"></div>
                <div class="traffic-info">
                  <span class="patient">{{ apt.patientName }}</span>
                  <span class="doctor">assigned to {{ apt.doctor }}</span>
                </div>
                <!-- Compact status tag -->
                <span :class="['status-pill-sm', apt.status]">{{ apt.status }}</span>
              </div>
              
              <!-- Shortcut to view the full system logs -->
              <div class="card-footer-link">
                <router-link to="/admin/logs" class="view-all-link">Full Traffic Audit →</router-link>
              </div>
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Main dashboard container constraining width for better readability on large screens */
.admin-dashboard-container {
  max-width: 1300px;
  margin: 0 auto;
}

/* ANALYTICS: Auto-fitting grid for metric cards */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

/* BaseCard overrides for full-bleed clickable area */
.analytic-card { padding: 0 !important; }

.analytic-link {
  display: block;
  padding: 1.5rem 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

/* Subtle elevation and color shift on hover */
.analytic-link:hover {
  background: var(--bg-faint, #f8fafc);
  transform: translateY(-2px);
}

.analytic-flex {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.analytic-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.analytic-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.analytic-value {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
}

/* MAIN GRID: Two-column layout for dashlets */
.quick-overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.card-header h2 { margin: 0; font-size: 1.25rem; }
.subtitle {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
  font-weight: 600;
}

/* ACTION LINKS: Styled navigation blocks */
.action-links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-faint);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-main);
  transition: all 0.2s ease;
}

/* Interactive feedback for internal module links */
.action-item:hover {
  border-color: var(--primary-main);
  background: var(--bg-pure);
  transform: translateX(6px);
  box-shadow: var(--shadow-md);
}

.action-item:hover .action-title,
.action-item:hover .action-arrow {
  color: var(--primary-main);
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.5rem;
}

/* Module-specific icon colors */
.action-icon.user { background: var(--bg-muted); color: var(--error-text); }
.action-icon.log { background: var(--bg-muted); color: var(--primary-main); }

.action-text { flex: 1; }
.action-title { display: block; font-weight: 700; font-size: 1.1rem; }
.action-desc { font-size: 0.85rem; color: var(--text-dim); }
.action-arrow { color: var(--primary-main); opacity: 0.9; font-size: 1.25rem; font-weight: 800; }

/* TRAFFIC LIST: Vertical list of scheduled events */
.traffic-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.traffic-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-faint, #f8fafc);
  border-radius: 12px;
}

.traffic-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* Marker color synchronization */
.traffic-marker.pending { background: #facc15; }
.traffic-marker.approved { background: #3b82f6; }
.traffic-marker.completed { background: #10b981; }

.traffic-info { flex: 1; display: flex; flex-direction: column; }
.patient { font-weight: 700; font-size: 0.95rem; }
.doctor { font-size: 0.75rem; color: var(--text-dim); font-weight: 600; }

/* Status pill refinements */
.status-pill-sm {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pill-sm.pending { background: rgba(234, 179, 8, 0.1); color: #d97706; }
.status-pill-sm.approved { background: rgba(59, 130, 246, 0.1); color: var(--primary-main); }
.status-pill-sm.completed { background: rgba(16, 185, 129, 0.1); color: #059669; }

/* Responsive adjustments for mid-sized screens */
@media (max-width: 900px) {
  .quick-overview-grid { grid-template-columns: 1fr; }
}
</style>
