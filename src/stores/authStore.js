import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * AUTHENTICATION STORE
 * Manages the user ecosystem, including registration, provisioning, and session state.
 * Uses localStorage to simulate a database for persistent identity management.
 */
export const useAuthStore = defineStore('auth', () => {
  // --- SESSION STATE ---
  // Stores the active user's profile information (id, name, email)
  const currentUser = ref(null)

  // Stores the active user's role (admin, doctor, or patient)
  const role = ref(null)

  // --- PERSISTENT USER REGISTRY ---
  // These are the seed accounts included by default when the application starts for the first time.
  const defaultUsers = [
    { id: 'admin-0', name: 'System Admin', email: 'admin@medi.com', password: 'admin', role: 'admin' },
    { id: 'doc-0', name: 'Dr. Sarah Smith', email: 'doctor@medi.com', password: 'password', role: 'doctor', specialization: 'General Consultation' },
    { id: 'pat-0', name: 'John Patient', email: 'patient@medi.com', password: 'password', role: 'patient' }
  ]

  // Initialize the users list from localStorage if available; otherwise, use the default accounts.
  const users = ref(JSON.parse(localStorage.getItem('registered_users')) || defaultUsers)

  // --- GETTERS ---
  // Computed property to check if a user is currently logged into the system.
  const isAuthenticated = computed(() => !!currentUser.value)

  // Computed property to provide access to the entire user registry.
  const allUsers = computed(() => users.value)

  // --- ACTIONS ---

  /**
   * registerUser - Allows patients to create their own accounts.
   * Takes user profile data, assigns a unique ID, and sets the role to 'patient'.
   */
  function registerUser(userData) {
    const newUser = {
      ...userData,
      id: `pat-${Date.now()}`, // Generate unique ID based on timestamp
      role: 'patient' // Force patient role for self-registration
    }
    // Add the new user to the reactive state list
    users.value.push(newUser)
    // Synchronize the updated list to localStorage
    persistUsers()
    return { success: true }
  }

  /**
   * provisionDoctor - Allows Admins to create professional doctor accounts.
   * Specifically used by the Admin portal to add staff members.
   */
  function provisionDoctor(doctorData) {
    const newDoc = {
      ...doctorData,
      id: `doc-${Date.now()}`, // Generate unique clinic ID
      role: 'doctor' // Assign the professional doctor role
    }
    // Inject the new provider into the system registry
    users.value.push(newDoc)
    // Persist changes to local persistence
    persistUsers()
    return { success: true }
  }

  /**
   * login - Verifies credentials against the registry.
   * Searches the users list for a match on both email and password.
   */
  function login(email, password) {
    // Find the user object that matches the provided credentials
    const user = users.value.find(u => u.email === email && u.password === password)

    // If a valid user is found, establish a session
    if (user) {
      // Set the session state in the store
      currentUser.value = { id: user.id, name: user.name, email: user.email }
      role.value = user.role

      // Save session data to localStorage so it persists across page reloads
      localStorage.setItem('session_user', JSON.stringify(currentUser.value))
      localStorage.setItem('session_role', user.role)
      return { success: true, role: user.role }
    }

    // Return an error if credentials do not match
    return { success: false, message: 'Invalid identity or password.' }
  }

  /**
   * logout - Terminates the active session and clears all stored data.
   */
  function logout() {
    // Clear the reactive store state
    currentUser.value = null
    role.value = null
    // Remove session tokens from browser storage
    localStorage.removeItem('session_user')
    localStorage.removeItem('session_role')
  }

  /**
   * deleteUser - Removes a user from the system registry.
   * Primarily used by Admins to revoke access.
   */
  function deleteUser(userId) {
    // Filter the registry to exclude the user with the specified ID
    users.value = users.value.filter(u => u.id !== userId)
    // Synchronize the deletion to persistent storage
    persistUsers()
  }

  /**
   * updateUser - Modifies an existing user's profile data.
   */
  function updateUser(userId, updatedData) {
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updatedData }
      persistUsers()
    }
  }

  /**
   * updateStatus - Changes a user's access status (active/revoked).
   */
  function updateStatus(userId, status) {
    const index = users.value.findIndex(u => u.id === userId)
    if (index !== -1) {
      users.value[index].status = status
      persistUsers()
    }
  }

  /**
   * persistUsers - Helper utility to sync the registry to localStorage.
   * This acts as the "Save" function for our simulated database.
   */
  function persistUsers() {
    localStorage.setItem('registered_users', JSON.stringify(users.value))
  }

  // --- INITIALIZATION ---
  // Check if there is an existing session saved in localStorage when the app boots up.
  const storedUser = localStorage.getItem('session_user')
  const storedRole = localStorage.getItem('session_role')

  // If a session exists, restore it into the store's state.
  if (storedUser && storedRole) {
    currentUser.value = JSON.parse(storedUser)
    role.value = storedRole
  }

  // Export the reactive state, getters, and actions for use in Vue components.
  return {
    currentUser,
    role,
    isAuthenticated,
    allUsers,
    login,
    logout,
    registerUser,
    provisionDoctor,
    deleteUser,
    updateUser,
    updateStatus
  }
})
