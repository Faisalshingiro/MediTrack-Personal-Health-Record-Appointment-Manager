<script setup>
/**
 * HOME VIEW (LANDING PAGE)
 * This is the public entry point of the MediTrack platform.
 * It features a professional, clinical-grade aesthetic designed to build trust 
 * with healthcare providers and patients alike.
 */
import { useRouter } from 'vue-router'
import BaseButton from '../components/base/BaseButton.vue'
import { useThemeStore } from '../stores/themeStore'

// Access the router for navigation to the authentication portal.
const router = useRouter()
// Access the theme store to allow users to toggle themes directly from the landing page.
const themeStore = useThemeStore()

/**
 * scrollToSection - Helper for smooth internal navigation.
 * Uses native browser scroll APIs to reach specific sections (Features, About).
 */
const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="landing-page">
    <!-- 
      NAVIGATION BAR: Transparent glassmorphism effect.
      Contains branding and primary calls to action.
    -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <img src="../assets/logo.jpeg" alt="MediTrack Logo" class="brand-logo-img" />
        </div>

        <div class="nav-links">
          <!-- Internal section navigation -->
          <a href="#" @click.prevent="scrollToSection('features')" class="nav-item">Features</a>
          <a href="#" @click.prevent="scrollToSection('about')" class="nav-item">About Us</a>
          
          <!-- Primary Access: Login -->
          <BaseButton @click="router.push('/login')" size="md" variant="primary">
            Login
          </BaseButton>
          
          <!-- Utility: Global Theme Switch -->
          <button @click="themeStore.toggleTheme" class="theme-toggle" :title="themeStore.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span v-if="themeStore.isDarkMode">☀️</span>
            <span v-else>🌙</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- 
      HERO SECTION: THE IMPACT AREA 
      Uses a modern gradient background and large typography to define the platform's value.
    -->
    <header class="hero">
      <div class="hero-content">
        <!-- System Status Badge -->
        <div class="hero-badge">Healthcare Management Protocol 2026</div>
        <h1 class="hero-title">
          Smart Medical <span class="clinical-text">Management</span> 
          for Modern Clinics.
        </h1>
        <p class="hero-subtitle">
          Experience the next generation of healthcare coordination. Secure, fast, and 
          optimized for doctors, patients, and clinical administrators.
        </p>
        <div class="hero-actions">
          <!-- Primary conversion button -->
          <BaseButton @click="router.push('/login')" size="lg" variant="primary">
              Get started
          </BaseButton>
          <!-- Learn more scroll button -->
          <BaseButton @click="scrollToSection('features')" size="lg" variant="outline" class="clinical-outline">
            View Features
          </BaseButton>
        </div>
      </div>
    </header>

    <!-- 
      FEATURES SECTION: ROLE-BASED CAPABILITIES 
      Highlights the three distinct portals that make up the MediTrack ecosystem.
    -->
    <section id="features" class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">One Platform. Three Portals.</h2>
          <p class="section-subtitle">Tailored healthcare experiences for every persona.</p>
        </div>

        <div class="features-grid">
          <!-- PATIENT PORTAL: Health tracking and booking -->
          <div class="feature-card">
            <div class="feature-icon patient">🏥</div>
            <h3>Patient Portal</h3>
            <p>Access your medical history, book consultations, and maintain digital logs of your health journey.</p>
            <ul class="feature-list">
              <li>✓ Easy Appointment Booking</li>
              <li>✓ Digital Health Records</li>
              <li>✓ Personal Notes Log</li>
            </ul>
          </div>

          <!-- DOCTOR SUITE: High-efficiency clinical workflow -->
          <div class="feature-card highlighted">
            <div class="feature-icon doctor">🩺</div>
            <h3>Doctor Suite</h3>
            <p>Streamlined workflow for clinical providers to manage patient queues and record diagnostic data.</p>
            <ul class="feature-list">
              <li>✓ Real-time Patient Queue</li>
              <li>✓ Secure Diagnostic Entry</li>
              <li>✓ Historical Record Access</li>
            </ul>
          </div>

          <!-- ADMIN MATRIX: Platform oversight and security -->
          <div class="feature-card">
            <div class="feature-icon admin">🛡️</div>
            <h3>Admin Matrix</h3>
            <p>High-level system administration to monitor platform health and manage professional identities.</p>
            <ul class="feature-list">
              <li>✓ System Analytics</li>
              <li>✓ User ID Provisioning</li>
              <li>✓ Access Logs & Security</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 
      SIMPLE FOOTER: Branding and Policy 
      Clean layout with copyright and essential legal links.
    -->
    <footer id="about" class="footer">
      <div class="container simple-footer-content">
        <div class="footer-left">
          <img src="../assets/logo.jpeg" alt="MediTrack Logo" class="footer-logo-minimal" />
          <span class="copyright">&copy; 2026 Medi-Track Clinical Systems.</span>
        </div>
        
        <div class="footer-right">
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
          <div class="footer-divider"></div>
          <a href="#" class="footer-link">Support</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Core landing layout anchoring the page's visual tone */
.landing-page {
  width: 100%;
  overflow-x: hidden;
  background: var(--bg-pure);
  color: var(--text-main);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* NAVBAR: Sticky position with clinical glassmorphism */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 0.75rem 0;
  background: var(--glass);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--primary-light);
  box-shadow: 0 4px 20px rgba(2, 132, 199, 0.05);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo-img {
  height: 90px;
  width: auto;
  object-fit: contain;
  margin-top: -10px;
  margin-bottom: -10px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 3rem;
}

.theme-toggle {
  background: var(--bg-muted);
  border: 1px solid var(--glass-border);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  transition: var(--transition-smooth);
}

.theme-toggle:hover {
  background: var(--primary-light);
  transform: scale(1.05);
}

.nav-item {
  color: var(--text-dim);
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.2s;
  text-decoration: none;
}

/* HERO: Eye-catching gradients and massive typography */
.hero {
  position: relative;
  padding: 15rem 2rem 10rem;
  display: flex;
  justify-content: center;
  text-align: center;
  background: 
    radial-gradient(circle at 10% 20%, rgba(2, 132, 199, 0.05) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
    var(--bg-pure);
}

.hero-content {
  max-width: 900px;
  z-index: 10;
}

.hero-badge {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  background: var(--bg-pure);
  color: var(--primary-main);
  border: 1px solid var(--glass-border);
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 2.5rem;
  box-shadow: var(--shadow-md);
}

/* Gradient typography for the primary heading */
.clinical-text {
  background: linear-gradient(135deg, var(--primary-main), #0369a1);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.4rem;
  color: var(--text-dim);
  max-width: 750px;
  margin: 0 auto 4rem;
  line-height: 1.6;
  font-weight: 700;
}

/* FEATURE GRID: Responsive multi-column layout for portal highlights */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

.feature-card {
  background: var(--bg-faint);
  padding: 3rem 2.5rem;
  border-radius: 24px;
  border: 1px solid var(--glass-border);
  transition: all 0.3s;
}

.feature-card:hover {
  background: var(--bg-pure);
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  border-color: var(--primary-main);
}

/* Highlighting the central core value prop (Doctor Suite) */
.feature-card.highlighted {
  background: var(--primary-light);
  border-color: var(--primary-main);
}

/* Standardized footer for legal compliance and support navigation */
.footer {
  background: var(--bg-pure);
  padding: 2.5rem 0;
  border-top: 1px solid var(--primary-light);
}

.simple-footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 700;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.footer-link {
  color: var(--text-dim);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-divider {
  width: 1px;
  height: 16px;
  background: var(--bg-muted);
}

/* Responsive adjustments for mobile and tablet viewers */
@media (max-width: 1024px) {
  .features-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .hero { padding: 12rem 1.5rem 8rem; }
  .nav-links { gap: 1rem; }
  .simple-footer-content { flex-direction: column; gap: 1.5rem; }
}
</style>
