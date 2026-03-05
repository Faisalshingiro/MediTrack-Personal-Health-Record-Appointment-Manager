import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

// Primary View Components imported for core routing.
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import PatientDashboard from '../views/patient/Dashboard.vue'
import DoctorDashboard from '../views/doctor/Dashboard.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'

/**
 * VUE ROUTER CONFIGURATION
 * This is the central navigation backbone of the application.
 * It maps URLs to specific view components and enforces "Route Guard" security patterns.
 */

const routes = [
    // --- PUBLIC ACCESS ROUTES ---
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/register',
        name: 'register',
        component: RegisterView
    },

    // --- PROTECTED PATIENT ROUTES ---
    // Specifically tagged with 'requiresAuth' and role-pinned to 'patient'.
    {
        path: '/patient',
        name: 'patient-dashboard',
        component: PatientDashboard,
        meta: { requiresAuth: true, role: 'patient' }
    },
    {
        path: '/patient/appointments',
        name: 'patient-appointments',
        // Lazy-loading for non-immediate sub-pages to optimize bundle size.
        component: () => import('../views/patient/Appointments.vue'),
        meta: { requiresAuth: true, role: 'patient' }
    },
    {
        path: '/patient/records',
        name: 'patient-records',
        component: () => import('../views/patient/Records.vue'),
        meta: { requiresAuth: true, role: 'patient' }
    },

    // --- PROTECTED DOCTOR ROUTES ---
    {
        path: '/doctor',
        name: 'doctor-dashboard',
        component: DoctorDashboard,
        meta: { requiresAuth: true, role: 'doctor' }
    },
    {
        path: '/doctor/queue',
        name: 'doctor-queue',
        component: () => import('../views/doctor/Queue.vue'),
        meta: { requiresAuth: true, role: 'doctor' }
    },
    {
        path: '/doctor/schedules',
        name: 'doctor-schedules',
        component: () => import('../views/doctor/Schedules.vue'),
        meta: { requiresAuth: true, role: 'doctor' }
    },

    // --- PROTECTED ADMIN ROUTES ---
    {
        path: '/admin',
        name: 'admin-dashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: () => import('../views/admin/UserManagement.vue'),
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/admin/logs',
        name: 'admin-logs',
        component: () => import('../views/admin/SystemLogs.vue'),
        meta: { requiresAuth: true, role: 'admin' }
    }
]

// Initialize the router with HTML5 Web History mode for clean URLs.
const router = createRouter({
    history: createWebHistory(),
    routes
})

/**
 * GLOBAL NAVIGATION GUARD (THE "GATEKEEPER")
 * This function intercepts every navigation attempt before it resolves.
 * It verifies authentication status and role clearance for protected modules.
 */
router.beforeEach((to, from, next) => {
    // Access the authentication store to get the real-time session state.
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated
    const userRole = authStore.role

    // 1. AUTHENTICATION CHECK: Is the user trying to visit a locked door?
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            // Not logged in? Redirect to the login portal.
            next('/login')
        }
        // 2. AUTHORIZATION CHECK: Is the user cleared for this specific room?
        else if (to.meta.role && to.meta.role !== userRole) {
            // Logged in but wrong role? Send them back to their authorized dashboard.
            // This prevents "Access Escalation" (e.g., a patient manually typing '/admin').
            next(`/${userRole}`)
        } else {
            // Authorized! Allow navigation to proceed.
            next()
        }
    }
    // 3. REVERSE AUTHENTICATION: Prevent logged-in users from seeing the login screen again.
    else if (to.path === '/login' && isAuthenticated) {
        // Redirect active sessions directly to their dashboard.
        next(`/${userRole}`)
    }
    else {
        // Publicly available routes (Home, Registration).
        next()
    }
})

export default router
