<script setup>
/**
 * BASE CARD COMPONENT
 * A versatile structural container used throughout the application to group content.
 * Provides a standardized visual style including borders, shadows, and rounded corners.
 */
defineProps({
  // title: A simple string property to display a header title.
  title: {
    type: String,
    default: ''
  },
  // noPadding: If true, removes internal margins for full-bleed content (like images or tables).
  noPadding: {
    type: Boolean,
    default: false
  },
  // hover: Enables a lifting animation and shadow depth when the user hovers over the card.
  hover: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <!-- Main container with conditional 'has-hover' class for interaction styles -->
  <div class="base-card" :class="{ 'has-hover': hover }">
    
    <!-- HEADER SECTION: Only renders if a title is provided or the 'header' slot is used -->
    <div v-if="title || $slots.header" class="card-header">
      <!-- Named slot allows for complex header layouts (e.g., icons, buttons) -->
      <slot name="header">
        <!-- Default fallback: horizontal title with standard typography -->
        <h2 class="card-title">{{ title }}</h2>
      </slot>
    </div>

    <!-- MAIN CONTENT AREA: The primary container for the card's data -->
    <div class="card-body" :class="{ 'no-padding': noPadding }">
      <!-- Default slot for everything inside the <BaseCard> tags -->
      <slot />
    </div>

    <!-- FOOTER SECTION: Optional area for secondary actions or meta-information -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
/* Core card container properties using theme-aware design tokens */
.base-card {
  background: var(--bg-pure);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

/* Interaction: Visual feedback for clickable or interactive cards */
.base-card.has-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: var(--primary-main);
}

.card-header {
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--bg-muted, #f1f5f9);
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

/* Default internal spacing for card content */
.card-body {
  padding: 1.5rem;
}

/* Modifier to remove padding for seamless components (like tables) */
.card-body.no-padding {
  padding: 0;
}

.card-footer {
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
}
</style>
