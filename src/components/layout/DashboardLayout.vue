<script setup>
/**
 * DASHBOARD LAYOUT
 * The main structural wrapper for all role-based dashboards (Admin, Doctor, Patient).
 * It provides a standardized shell including the sidebar navigation, system-wide header,
 * and the main responsive viewport for nested clinical views.
 */
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { computed } from 'vue'

// Vue Router hooks for programmatic navigation and route metadata.
const router = useRouter()
const route = useRoute()

// Component-level access to authentication and theme persistence stores.
const authStore = useAuthStore()
const themeStore = useThemeStore()

/**
 * handleLogout - Logic to safely terminate a clinical session.
 * Clears reactive store state and redirects the user back to the authentication portal.
 */
const handleLogout = () => {
  authStore.logout() // Clear session cache and state.
  router.push('/login') // Redirect to entry point.
}

/**
 * navItems - Computed array of navigation links tailored to the user's professional role.
 * This ensures that patients cannot see administrative links and vice versa (RBAC).
 */
const navItems = computed(() => {
  const role = authStore.role
  const base = [
    // Standard dashboard entry point shared by all roles.
    { label: 'Dashboard', icon: '📊', path: `/${role}` },
  ]
  
  // PATIENT: Links to personal health management.
  if (role === 'patient') {
    base.push({ label: 'My Appointments', icon: '📅', path: '/patient/appointments' })
    base.push({ label: 'Health Records', icon: '📁', path: '/patient/records' })
  } 
  // DOCTOR: Links to active clinical queues and schedules.
  else if (role === 'doctor') {
    base.push({ label: 'Patient Queue', icon: '👥', path: '/doctor/queue' })
    base.push({ label: 'Schedules', icon: '⏰', path: '/doctor/schedules' })
  } 
  // ADMIN: Links to system-wide identity management and auditing.
  else if (role === 'admin') {
    base.push({ label: 'User Management', icon: '🛡️', path: '/admin/users' })
    base.push({ label: 'System Logs', icon: '📜', path: '/admin/logs' })
  }
  
  return base
})

/**
 * currentDate - Formatted system date for display in the header.
 * Provides real-time context to medical staff during their shifts.
 */
const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })
})
</script>

<template>
  <div class="dashboard-shell">
    <!-- 
      SIDEBAR NAVIGATION 
      Contains the branding, primary navigation menu, and user session controls.
      Designed with accessibility (ARIA) and keyboard focus in mind.
    -->
    <aside class="sidebar" aria-label="Dashboard Navigation">
      <div class="sidebar-top">
        <!-- Application Branding -->
        <div class="logo">
          <img src="../../assets/logo.jpeg" alt="MediTrack Logo" class="logo-img" />
        </div>

        <!-- Role-based navigation menu rendering -->
        <nav class="nav-menu">
          <router-link 
            v-for="item in navItems" 
            :key="item.label"
            :to="item.path"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </router-link>
        </nav>
      </div>

      <!-- 
        USER FOOTER 
        Displays the active professional profile and persistent system controls.
      -->
      <div class="sidebar-footer">
        <!-- Profile summary: Avatar and Role display -->
        <div class="user-profile">
          <div class="user-avatar">
            {{ authStore.currentUser?.name?.[0]?.toUpperCase() || 'U' }}
          </div>
          <div class="user-meta">
            <span class="user-name">{{ authStore.currentUser?.name }}</span>
            <span class="user-role">{{ authStore.role }}</span>
          </div>
        </div>

        <!-- Theme Toggle: Switches between surgical Light and focused Dark modes -->
        <button @click="themeStore.toggleTheme" class="btn-theme-sidebar">
          <span v-if="themeStore.isDarkMode">☀️ Light Mode</span>
          <span v-else>🌙 Dark Mode</span>
        </button>
        
        <!-- Logout action triggered by a clearly marked red button -->
        <button @click="handleLogout" class="btn-logout" aria-label="Sign out of system">
          <span class="logout-icon">⏻</span>
          Sign Out
        </button>
      </div>
    </aside>

    <!-- 
      MAIN VIEWPORT 
      The primary content area where role-specific clinical views are mounted.
    -->
    <main class="viewport">
      <!-- Standardized view header containing page titles and utility actions -->
      <header class="view-header">
        <div class="header-left">
          <!-- Named slot for granular control over the view title -->
          <h1 class="page-title">
            <slot name="header-title">Overview</slot>
          </h1>
          <p class="current-date">{{ currentDate }}</p>
        </div>
        
        <!-- Header Actions: Quick theme toggle and system notification feed -->
        <div class="header-right">
          <button @click="themeStore.toggleTheme" class="theme-toggle-btn" :title="themeStore.isDarkMode ? 'Switch to Light' : 'Switch to Dark'">
            <span v-if="themeStore.isDarkMode">☀️</span>
            <span v-else>🌙</span>
          </button>
          
          <button class="notif-btn" aria-label="Notifications">
            <!-- Indicator badge for unread clinical alerts -->
            <span class="notif-badge"></span>
            🔔
          </button>

          <div class="header-divider"></div>

          <!-- System Status Monitor: Visual confirmation of active server connection -->
          <div class="profile-summary">
            <span class="status-indicator"></span>
            System Active
          </div>
        </div>
      </header>

      <!-- Main content body where the router component is injected -->
      <div class="view-content">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Main shell occupying full viewport with a flex-row layout */
.dashboard-shell {
  display: flex;
  height: 100vh;
  background: var(--bg-muted, #f1f5f9);
  color: var(--text-main, #0f172a);
  overflow: hidden;
}

/* SIDEBAR: Custom-width vertical navigation drawer */
.sidebar {
  width: 260px;
  background: var(--bg-pure);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  transition: all 0.3s ease;
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.02);
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  padding: 0;
}

.logo-img {
  width: 100%;
  max-width: 160px;
  height: auto;
  object-fit: contain;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* Link styling with high-contrast active and hover states */
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.625rem 0.875rem;
  border-radius: 10px;
  color: var(--text-dim, #64748b);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: var(--bg-faint, #f8fafc);
  color: var(--primary-main);
}

.nav-link.active {
  background: var(--primary-light, #e0f2fe);
  color: var(--primary-main);
}

.nav-icon {
  font-size: 1.15rem;
}

/* FOOTER: Fixed section at the bottom of the sidebar registry */
.sidebar-footer {
  padding-top: 0.75rem;
  border-top: 1px solid var(--bg-muted, #f1f5f9);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary-light);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--primary-main);
  border: 1px solid var(--primary-light);
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 700;
}

.user-role {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: var(--text-light);
  letter-spacing: 0.05em;
  font-weight: 700;
}

/* Action button resets for consistent UI appearance */
.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.6rem;
  background: var(--bg-faint);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--error-text);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-logout:hover {
  background: var(--error-text);
  color: white;
}

.btn-theme-sidebar {
  width: 100%;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.6rem;
  background: var(--bg-muted);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-main);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
}

/* VIEWPORT: The primary interactive arena */
.viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg-faint);
}

.view-header {
  padding: 1rem 2rem 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: var(--bg-pure);
  border-bottom: 1px solid var(--bg-muted);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 0.15rem;
  color: var(--text-main);
}

.current-date {
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.notif-btn, .theme-toggle-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-faint);
  border: 1px solid var(--bg-muted);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.15rem;
  transition: all 0.2s ease;
}

.notif-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  background: var(--error-text);
  border-radius: 50%;
  border: 2px solid var(--bg-pure);
}

.header-divider {
  width: 1px;
  height: 20px;
  background: var(--glass-border);
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-dim);
}

.status-indicator {
  width: 7px;
  height: 7px;
  background: var(--secondary-main);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(5, 150, 105, 0.2);
}

.view-content {
  flex: 1;
  padding: 1rem 2rem 1.5rem;
  overflow-y: auto;
}

/* Custom clinical scrollbar */
.view-content::-webkit-scrollbar {
  width: 6px;
}
.view-content::-webkit-scrollbar-track {
  background: transparent;
}
.view-content::-webkit-scrollbar-thumb {
  background: var(--bg-muted);
  border-radius: 10px;
}

/* Responsive collapse for non-desktop screens */
@media (max-width: 1024px) {
  .sidebar { width: 80px; padding: 1.5rem 0.75rem; }
  .logo-text, .nav-label, .user-meta, .btn-logout span:not(.logout-icon) { display: none; }
  .nav-link { justify-content: center; padding: 0.75rem; }
  .sidebar-footer { padding: 1rem 0.25rem 0; }
}
</style>
