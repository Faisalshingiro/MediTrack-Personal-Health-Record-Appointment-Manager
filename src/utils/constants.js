/**
 * APPLICATION CONSTANTS
 * A centralized source of truth for fixed values used across the system.
 * Using constants instead of raw strings prevents typos and simplifies 
 * large-scale refactoring when business logic changes.
 */

/**
 * ROLES - Defines the different access tiers available in the system.
 * Used by the Router for guard logic and by components for UI conditioning.
 */
export const ROLES = {
    PATIENT: 'patient', // Read/Write own medical notes, read clinical history.
    DOCTOR: 'doctor',   // Managed patients, clinical diary, diagnostic entry.
    ADMIN: 'admin'      // Full system telemetry, user management, audit logs.
}

/**
 * APPOINTMENT_STATUS - Tracks the lifecycle of a clinical booking.
 */
export const APPOINTMENT_STATUS = {
    PENDING: 'pending',     // Initial state after patient booking.
    APPROVED: 'approved',   // Confirmed by provider/admin, ready for consultation.
    COMPLETED: 'completed', // Consultation finished, clinical record issued.
    CANCELLED: 'cancelled'  // Irreversibly terminated by patient or admin.
}
