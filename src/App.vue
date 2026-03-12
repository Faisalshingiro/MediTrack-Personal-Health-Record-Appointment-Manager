<script setup>
/**
 * ROOT COMPONENT (App.vue)
 * The top-level container for the entire Single Page Application (SPA).
 * It manages global app-level logic like theme initialization and 
 * provides the primary viewport for the router.
 */
import { onMounted } from 'vue'
import { useThemeStore } from './stores/themeStore'

// Instantiate the theme store to manage Light/Dark mode preferences.
const themeStore = useThemeStore()
</script>

<template>
  <!-- 
    ROUTER VIEW 
    The dynamic portal where all page components (Home, Dashboards, Auth) 
    are swapped in based on the current URL.
  -->
  <router-view></router-view>
</template>

<style>
/**
 * TOP-LEVEL GLOBAL STYLES
 * High-level layout resets or app-wide transitions can be defined here.
 * Most component styling is handled locally in scoped 'style' blocks.
 */
</style>
