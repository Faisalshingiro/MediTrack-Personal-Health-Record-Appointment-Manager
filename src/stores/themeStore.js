import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * THEME STORE
 * Manages the application's visual mode (Light vs Dark).
 * Synchronizes the theme state with the browser's Document Object Model (DOM)
 * and persists the user's preference in localStorage.
 */
export const useThemeStore = defineStore('theme', () => {
    // STATE: Reactive flag indicating if dark mode is active.
    // Initial value is retrieved from localStorage for persistent preferences.
    const isDarkMode = ref(localStorage.getItem('theme') === 'dark')

    /**
     * toggleTheme - Switches the visual mode.
     * Updates reactive state, persists the choice, and applies the corresponding CSS classes.
     */
    function toggleTheme() {
        // Flat the boolean value.
        isDarkMode.value = !isDarkMode.value
        // Save the string 'dark' or 'light' to browser storage.
        localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
        // Trigger the DOM update to apply new styles.
        updateBodyClass()
    }

    /**
     * updateBodyClass - Direct DOM manipulation helper.
     * Injects or removes the 'dark-mode' class at the root element (<html>).
     * This class acts as a global CSS hook for variable-based theming.
     */
    function updateBodyClass() {
        if (isDarkMode.value) {
            // Apply the dark theme class.
            document.documentElement.classList.add('dark-mode')
        } else {
            // Revert to light theme by removing the class.
            document.documentElement.classList.remove('dark-mode')
        }
    }

    // --- INITIALIZATION ---
    // Ensure the correct theme class is applied immediately when the store is first loaded.
    updateBodyClass()

    // Export the state and toggle method for use in headers or settings components.
    return { isDarkMode, toggleTheme }
})
