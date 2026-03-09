<script setup>
/**
 * BASE BUTTON COMPONENT
 * A highly reusable and standardized button used across clinical and patient portals.
 * Supports various visual variants (primary, secondary, etc.) and global loading states.
 */
defineProps({
  // variant: Defines the visual style and hierarchy (e.g., 'primary' for main actions).
  variant: {
    type: String,
    default: 'primary'
  },
  // size: Controls the padding and typography scale of the button.
  size: {
    type: String,
    default: 'md'
  },
  // isLoading: If true, disables interaction and displays a spinning loader.
  isLoading: {
    type: Boolean,
    default: false
  },
  // type: The native HTML button type (e.g., 'submit' for forms).
  type: {
    type: String,
    default: 'button'
  }
})
</script>

<template>
  <!-- Main button element with dynamic classes for variant and size -->
  <button 
    :type="type" 
    class="base-btn" 
    :class="[variant, size, { 'is-loading': isLoading }]"
    :disabled="isLoading"
  >
    <!-- Slot for the primary label or combined icon+text content -->
    <span v-if="!isLoading">
      <slot />
    </span>
    
    <!-- Loading indicator: only visible when the component is in a busy state -->
    <span v-else class="loader"></span>
  </button>
</template>

<style scoped>
/* Base structural properties for clinical-grade interaction */
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  gap: 0.5rem;
  font-family: inherit;
  outline: none;
}

/* Tactile feedback on press */
.base-btn:active { transform: scale(0.98); }

/* Visual state for disabled or busy buttons */
.base-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* SIZES: Controls the spatial footprint of the interaction area */
.sm { padding: 0.5rem 1rem; font-size: 0.8rem; }
.md { padding: 0.75rem 1.5rem; font-size: 0.9rem; }
.lg { padding: 1rem 2rem; font-size: 1rem; }

/* VARIANTS: Defines the visual hierarchy within the application */

/* PRIMARY: Used for the most important system actions (e.g., Save, Book) */
.primary {
  background: var(--primary-main) !important;
  color: var(--on-primary) !important;
}
.primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);
}

/* SECONDARY: Used for supporting or alternative actions */
.secondary {
  background: var(--primary-light);
  color: var(--primary-main);
}
.secondary:hover { background: #bae6fd; }

/* OUTLINE: Low-priority actions or secondary navigation choices */
.outline {
  background: transparent;
  border-color: var(--primary-main);
  color: var(--primary-main);
}
.outline:hover { background: var(--primary-light); }

/* GHOST: Minimalist actions, often used in navigation bars or lists */
.ghost {
  background: transparent;
  color: var(--text-dim);
}
.ghost:hover { background: var(--bg-muted); color: var(--text-main); }

/* LOADING STATE: Visual feedback during asynchronous operations */
.is-loading {
  position: relative;
  color: transparent !important; /* Hide label text while loading */
}

/* Custom CSS spinner for wait-state feedback */
.loader {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Loader color adjustment for lighter button variants */
.secondary .loader, .outline .loader, .ghost .loader {
  border-color: rgba(2, 132, 199, 0.1);
  border-top-color: var(--primary-main);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
