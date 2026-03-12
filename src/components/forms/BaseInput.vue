<script setup>
/**
 * BASE INPUT COMPONENT
 * A standardized form control used for all text-based data entries (email, names, passwords).
 * Integrates accessibility (ARIA), real-time validation feedback, and clinical styling.
 */
const props = defineProps({
  // modelValue: Supports Vue's two-way data binding (v-model).
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // label: Descriptive text rendered above the input field.
  label: {
    type: String,
    default: ''
  },
  // type: The native HTML input type (e.g., 'email', 'password', 'tel').
  type: {
    type: String,
    default: 'text'
  },
  // placeholder: Illustrative text shown when the input is empty.
  placeholder: {
    type: String,
    default: ''
  },
  // error: A validation message string. If present, it triggers the 'invalid' visual state.
  error: {
    type: String,
    default: ''
  },
  // id: Optional unique identifier for the input. If not provided, one is auto-generated.
  id: {
    type: String,
    default: null
  }
})

/**
 * defineEmits - Exposes the 'update:modelValue' event to the parent 
 * to facilitate reactive data synchronization.
 */
defineEmits(['update:modelValue'])

/**
 * uniqueId - Ensures every input has a valid 'id' and 'for' association for 
 * screen readers, supporting WCAG AA accessibility requirements.
 */
const inputId = props.id || `input-${Math.random().toString(36).slice(2, 9)}`

</script>

<template>
  <!-- Input wrapper with conditional error state context -->
  <div class="input-group" :class="{ 'has-error': error }">
    <!-- Descriptive Label: Essential for accessibility and user orientation -->
    <label v-if="label" :for="inputId" class="input-label">{{ label }}</label>
    
    <div class="input-container">
      <!-- 
        Main Input Element:
        Binds to 'modelValue' and emits changes on every keystroke.
      -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        class="base-input"
        :class="{ 'invalid': error }"
      >
    </div>

    <!-- 
      Validation Feedback:
      Renders the error message if a validation constraint is violated.
      Uses a named transition for smooth visual entry/exit.
    -->
    <Transition name="fade">
      <p v-if="error" class="error-text">{{ error }}</p>
    </Transition>
  </div>
</template>

<style scoped>
/* Structural layout for the input group */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

/* Typography for field descriptors */
.input-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-dim);
  margin-left: 0.25rem;
}

.input-container {
  position: relative;
}

/* Standardized field styling matching the MediTrack design system */
.base-input {
  width: 100%;
  padding: 0.875rem 1.125rem;
  background: var(--bg-pure);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  color: var(--text-main);
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
}

/* Subtle placeholder styling */
input::placeholder {
  color: var(--text-light);
}

/* Focused state: Increases visibility and clearly indicates target interaction */
input:focus {
  border-color: var(--primary-main);
  background: var(--bg-pure);
  box-shadow: 0 0 0 4px var(--primary-light);
}

/* Invalid State: Visual alert for validation failures */
.base-input.invalid {
  border-color: var(--error-text);
}

.base-input.invalid:focus {
  box-shadow: 0 0 0 4px var(--error-border);
}

.error-text {
  color: var(--error-text);
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.25rem;
}

/* Smooth fade-in/out for error alerts */
.fade-enter-active, .fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
