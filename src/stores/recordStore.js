import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'
import { sanitize } from '../utils/securityUtils'

/**
 * MEDICAL RECORD STORE
 * This store manages sensitive clinical data, including prescriptions, consultation notes, 
 * and diagnostic summaries. It incorporates a security layer to ensure strict 
 * Role-Based Access Control (RBAC) across the clinical registry.
 */
export const useRecordStore = defineStore('records', () => {
    // Access the authentication store to verify permissions and identities.
    const authStore = useAuthStore()

    // --- STATE ---
    // Centralized reactive array holding the entirety of the clinical record database.
    const records = ref([])

    // --- GETTERS (Security Layer) ---
    /**
     * authorizedRecords - Computed property that enforces data privacy.
     * Implements logic to filter records based on the current user's role and identity, 
     * preventing cross-patient data exposure.
     */
    const authorizedRecords = computed(() => {
        const user = authStore.currentUser
        const role = authStore.role

        // If no session exists, return zero visibility.
        if (!user) return []

        // ADMIN ACCESS: Full system audit capability.
        if (role === 'admin') return records.value

        // DOCTOR ACCESS: Access to issued clinical notes or assigned patient records.
        if (role === 'doctor') {
            return records.value.filter(r => r.issuer === user.name || r.doctorId === user.id)
        }

        // PATIENT ACCESS: Exclusive access to their personal medical history.
        if (role === 'patient') {
            return records.value.filter(r => r.userId === user.id || r.patientId === user.id)
        }

        // Default: No visibility for unrecognized roles.
        return []
    })

    // --- ACTIONS (Security Layer) ---

    /**
     * addRecord - Create a new medical entry (CRUD: Create).
     * Includes mandatory sanitization to prevent XSS and validates creation rights based on role.
     */
    function addRecord(record) {
        // SECURITY GATEKEEPER: Ensure patients cannot forge professional consultation records.
        if ((record.type === 'consultation') && (authStore.role === 'patient')) {
            console.error('Security Alert: Unauthorized clinical recording attempt by patient profile.')
            return
        }

        // Inject the sanitized and timestamped record into the reactive registry.
        records.value.push({
            id: Date.now(), // Unique record identifier.
            date: new Date().toISOString().split('T')[0], // Standardize to YYYY-MM-DD format.
            ...record,
            // SECURITY: Strip malicious scripts or illegal HTML tags from user inputs.
            title: sanitize(record.title),
            content: sanitize(record.content)
        })
    }

    /**
     * deleteRecord - Permanently remove clinical data (CRUD: Delete).
     * Restricts deletion strictly to administrators or the original record owner.
     */
    function deleteRecord(id) {
        // Locate the target record to verify ownership.
        const record = records.value.find(r => r.id === id)
        if (!record) return

        // Authorization Check: Must be admin or the user who created the record.
        const canDelete = authStore.role === 'admin' || record.userId === authStore.currentUser?.id

        if (canDelete) {
            // Filter the existing list to effectively "delete" the target entry.
            records.value = records.value.filter(r => r.id !== id)
        } else {
            console.warn('Security Warning: Unauthorized deletion attempt blocked for record ID:', id)
        }
    }

    /**
     * updateRecord - Modify existing clinical entries (CRUD: Update).
     * Applies re-sanitization for all updated text fields to maintain security integrity.
     */
    function updateRecord(id, updatedData) {
        // Locate index of the record to be modified.
        const index = records.value.findIndex(r => r.id === id)
        if (index === -1) return

        const record = records.value[index]
        // Verify update permissions (Admin, Owner, or the clinical issuer).
        const canUpdate = authStore.role === 'admin' || record.userId === authStore.currentUser?.id || record.issuer === authStore.currentUser?.name

        if (canUpdate) {
            // Sanitize specific fields if they are included in the update payload.
            if (updatedData.title) updatedData.title = sanitize(updatedData.title)
            if (updatedData.content) updatedData.content = sanitize(updatedData.content)

            // Perform reactive merge of the new data into the old record.
            records.value[index] = {
                ...records.value[index],
                ...updatedData
            }
        }
    }

    // Export the store's state, computed visibility layer, and interaction methods.
    return { records, authorizedRecords, addRecord, deleteRecord, updateRecord }
})
