# 🚀 CareerOS: Enterprise AI Career Intelligence System
**Project Code:** `career-os-premium`  
**Target:** High-Ticket Upwork Portfolio Project (MERN + AI + Automation)  
**Architecture:** Modular Monolith / Clean Architecture  
**Version:** 1.3 (Agentic, RBAC, & Pattern-Driven)

---

## 🎯 1. Project Vision
CareerOS is an **"Agentic" Career Platform** designed to automate the job search lifecycle. It differentiates itself through **Semantic Matching** (matching roles to user "vibes" and goals), **Deep Intelligence** (Reddit/Glassdoor sentiment extraction), and **Automated Sync** (Gmail OAuth2), all while providing a professional SaaS experience.

---

## 🏗 2. Scalable Architecture & Design Patterns
To prove "Senior" status, the project follows **Clean Architecture** and **SOLID** principles.

### **The Modular Monolith Pattern**
Instead of a "folder-by-type" (all controllers in one folder), we use **Folder-by-Feature**. This makes the app highly scalable and easy to refactor into microservices.
- **/modules/auth**: Identity, JWT, and Role management.
- **/modules/jobs**: Kanban, Scrapers, and Application logic.
- **/modules/ai**: LLM Orchestration, Resume Morphing, and Sentiment Analysis.
- **/modules/billing**: Stripe Integration and Subscription logic.

### **Core Design Patterns**
1.  **Controller-Service-Repository Pattern**: 
    - *Controllers*: Handle HTTP requests/responses only.
    - *Services*: Pure business logic (e.g., calling OpenAI, processing Reddit data).
    - *Repositories/Models*: Direct Database interactions (Mongoose).
2.  **Strategy Pattern**: Used for the **Scraper Engine** (switching between Reddit, Glassdoor, and LinkedIn scrapers) and **Auth** (JWT vs. Google OAuth).
3.  **Observer Pattern**: Using **EventEmitter** or **Socket.io** to notify the Frontend when a background "AI Analysis" job is complete.
4.  **Singleton Pattern**: Ensuring a single, shared database connection instance.

---

## 🔑 3. Role-Based Access Control (RBAC) & Preferences
- **FREE**: Dashboard, manual tracking, max 10 active applications.
- **PRO**: Unlimited apps, AI Resume Morph, Gmail Sync, Reddit/Glassdoor Insight Engine.
- **ADMIN**: System-wide metrics, OpenAI token cost tracking, user management.
- **User Preference Engine**: Users define Target Roles, Tech Stack, Min Salary, and "Company Vibe" (Startup vs. Corp). The AI uses **Vector Search** to score jobs against these specific preferences.

---

## 🛠 4. Best Coding Practices (The "Upwork Standard")
1.  **Schema Validation**: Every request is validated by **Zod** before hitting the controller.
2.  **Security**: 
    - **HttpOnly Cookies** for JWT storage (XSS protection).
    - **Helmet** for secure headers & **Cors** whitelist.
    - **Rate Limiting** to prevent API abuse (especially on AI/Scraper routes).
3.  **Background Processing**: Heavy tasks (Scraping/AI) use **BullMQ + Redis**.
4.  **Graceful Error Handling**: Centralized global error middleware with custom `AppError` classes.
5.  **API Versioning**: All routes prefixed with `/api/v1/`.

---

## 🗺 5. Development Roadmap

### **Phase 1: Core & Preferences (Foundation)**
- [ ] Setup Express with **Modular Folder Structure**.
- [ ] **Auth Module**: JWT + RBAC Middleware + Google OAuth.
- [ ] **Preference Engine**: Multi-step onboarding to capture User Goals/Stack/Salary.
- [ ] **Kanban Board**: Drag-and-drop tracking via `react-beautiful-dnd`.

### **Phase 2: Intelligence & Scrapers (External Data)**
- [ ] **Service Layer**: Implement Puppeteer for Glassdoor/Google Rating extraction.
- [ ] **Reddit Module**: Background job to fetch "Interview" threads for target companies.
- [ ] **Sentiment AI**: OpenAI-driven "Pros/Cons" summary of company culture.

### **Phase 3: The Sync Engine (Email & Comms)**
- [ ] **Gmail API**: OAuth2 flow to connect user inboxes.
- [ ] **Auto-Threader**: Background task to link company emails to specific Job IDs.
- [ ] **AI Labelling**: Tagging emails as "Action Required" or "Rejection."

### **Phase 4: AI Resume Morph**
- [ ] **Format-Preserving Parser**: PDF/Docx text extraction.
- [ ] **AI Tailoring**: Update bullet points based on Job Description + User Preferences.
- [ ] **Export Service**: Re-inject text into a professional, downloadable file.

### **Phase 5: The "Clip" Extension & Automation**
- [ ] **Chrome Extension (V3)**: One-click "Save Job" from LinkedIn/Indeed.
- [ ] **Auto-Fill Logic**: Map user data into common ATS fields via the extension.

### **Phase 6: Admin & Monetization**
- [ ] **Stripe Module**: Subscription lifecycle management (Pro upgrade).
- [ ] **Admin Analytics**: Dashboard for token costs and user success rates.

---

## 📊 6. Core Database Schema Preview

```javascript
// Example: Preference Schema inside User Model
const PreferenceSchema = new Schema({
  roles: [String],
  minSalary: Number,
  stack: [String],
  vibe: { type: String, enum: ['startup', 'midsize', 'corporate'] }
});

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: ['free', 'pro', 'admin'], default: 'free' },
  preferences: PreferenceSchema,
  stripeId: String,
  createdAt: { type: Date, default: Date.now }
});
