# MEDI-TRACK: Secure Design & Threat Modeling Document

## 1. Assets to Protect
- **Personal Health Information (PHI):** Medical records and diagnosis notes.
- **Appointment Data:** Sensitive scheduling information and history.
- **User Identity & Roles:** Authentication tokens and permission levels (Admin/Doctor/Patient).
- **System Integrity:** Ensuring only authorized doctors can approve appointments.

## 2. Threat Modeling
| Attacker | Motivation | Threat | Mitigation |
| :--- | :--- | :--- | :--- |
| Unauthorized Public | Access private health data | **Broken Access Control** | Vue Router Navigation Guards (beforeEach) |
| Malicious Patient | Access other patients' records | **IDOR (Insecure Direct Object Reference)** | Filtering Pinia stores by `currentUser.id` |
| Malformed Input | Inject scripts or break UI | **XSS (Cross-Site Scripting)** | Using Vue's `v-bind` and `{{}}` instead of `v-html` |
| Role Manipulator | Gain Admin privileges | **Privilege Escalation** | Client-side role validation (simulated) |

## 3. Secure Coding Decisions

### A. Why we avoided v-html?
We exclusively used `{{ }}` interpolation. Vue's default behavior is to escape HTML, which prevents **XSS attacks**. Using `v-html` would render user-provided strings as HTML, allowing an attacker to inject `<script>` tags that could steal credentials.

### B. Input Validation
All forms use `v-model` for two-way binding and are validated using the `useValidation` composable. This ensures that only data in the correct format (e.g., email regex) is accepted before processing.

### C. Route Protection
We implemented `meta: { requiresAuth: true, role: '...' }` in `router/index.js`. The `router.beforeEach` guard serves as a gatekeeper, checking the user's role in the Pinia `authStore` before allowing them to enter a dashboard.

### D. Data Isolation
In the Pinia stores (specifically `appointmentStore.js`), we used **getters** to filter data based on the logged-in user's ID. This prevents one patient from seeing another patient's data in the UI.

---
*Note: This is a frontend-only simulation. In a production system, all these checks would be duplicated and strictly enforced on the server/backend.*
