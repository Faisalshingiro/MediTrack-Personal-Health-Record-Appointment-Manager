import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

/**
 * APPOINTMENT STORE
 * This store manages the lifecycle of medical appointments within the system.
 * It handles scheduling, status transitions (approvals/completions), and deletions.
 */
export const useAppointmentStore = defineStore('appointments', () => {
    // --- STATE ---
    // Central reactive array containing all appointment objects in the system.
    const appointments = ref([])

    // Access the authStore to retrieve the currently logged-in user's context.
    const authStore = useAuthStore()

    // --- GETTERS ---

    /**
     * patientAppointments - Computed property to isolate appointments for the current patient.
     * Filters the global list based on the patient's unique system ID.
     */
    const patientAppointments = computed(() => {
        // If no user is logged in, return an empty list immediately.
        if (!authStore.currentUser) return []
        // Filter the central list for items where the patientId matches the logged-in user.
        return appointments.value.filter(a => a.patientId === authStore.currentUser.id)
    })

    /**
     * doctorAppointments - Computed property to isolate appointments for doctors.
     * In this prototype, it provides a view of all scheduled traffic for clinical monitoring.
     */
    const doctorAppointments = computed(() => {
        if (!authStore.currentUser) return []
        // Currently returns all appointments; can be further filtered by doctor ID if needed.
        return appointments.value
    })

    // --- ACTIONS ---

    /**
     * addAppointment - Create a new appointment (CRUD: Create).
     * Takes form data, assigns a unique ID, and sets the initial status to 'pending'.
     */
    function addAppointment(appointment) {
        // Append the new appointment object to the reactive state.
        appointments.value.push({
            id: Date.now(), // Generate a unique identifier using the current timestamp.
            status: 'pending', // All new appointments start as 'pending' awaiting clinical approval.
            ...appointment // Spread the provided form data (date, doctor, symptoms, etc.).
        })
    }

    /**
     * updateStatus - Update the operational status of an appointment (CRUD: Update).
     * Used by doctors and admins to progress an appointment through its lifecycle.
     * Valid Statuses: 'pending', 'approved', 'completed', 'cancelled'.
     */
    function updateStatus(id, status) {
        // Find the specific appointment in the array using its unique ID.
        const appointment = appointments.value.find(a => a.id === id)
        // If the appointment exists, update its status field.
        if (appointment) {
            appointment.status = status
        }
    }

    /**
     * deleteAppointment - Remove an appointment from the system (CRUD: Delete).
     * Irreversibly filters out the specified appointment by its ID.
     */
    function deleteAppointment(id) {
        // Reassign the array to a filtered version excluding the target ID.
        appointments.value = appointments.value.filter(a => a.id !== id)
    }

    /**
     * updateAppointment - Update clinical or scheduling details of an existing appointment (CRUD: Update).
     * Merge new data into an existing appointment record.
     */
    function updateAppointment(id, updatedData) {
        // Locate the index of the target appointment record.
        const appointmentIndex = appointments.value.findIndex(a => a.id === id)
        // if found, merge the existing record with the new properties provided.
        if (appointmentIndex !== -1) {
            appointments.value[appointmentIndex] = {
                ...appointments.value[appointmentIndex],
                ...updatedData // Overwrite specific keys with updated clinical information.
            }
        }
    }

    // Export the state and methods so they can be accessed globally within the application.
    return {
        appointments,
        patientAppointments,
        doctorAppointments,
        addAppointment,
        updateStatus,
        deleteAppointment,
        updateAppointment
    }
})
