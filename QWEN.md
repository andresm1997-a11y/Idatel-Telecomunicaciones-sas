# Idatel SAS - Project Context

## Project Overview

**Idatel SAS** is a production-ready website and content management system (CMS) for **Idatel Teleco**, a Colombian fiber optic internet service provider (ISP) based in the Santander department.

The project serves two main purposes:
1. **Public-facing landing page** - Marketing site showcasing internet plans, coverage areas, features, and company information for potential customers.
2. **Admin dashboard** - A protected CMS panel where administrators can manage internet plans, site content (text and images), company information, team members, and login security settings.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19.2.4 |
| **Build Tool** | Vite 8.0.4 |
| **Routing** | React Router DOM 7.14.0 |
| **Icons** | Lucide React 1.8.0 |
| **Backend / Auth / DB** | Firebase 12.12.0 (Auth, Firestore, Storage) |
| **Linting** | ESLint 9.39.4 with React Hooks and React Refresh plugins |
| **Deployment** | Vercel (configured via `vercel.json`) |
| **Module System** | ES Modules (`"type": "module"`) |

**Notable:** No TypeScript, no CSS framework (no Tailwind, no Bootstrap) - all styling is hand-written custom CSS using CSS variables, media queries, and animations.

---

## Building and Running

### Prerequisites
- Node.js (latest LTS recommended)
- npm (comes with Node.js)

### Commands

```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build locally
npm run preview
```

### Deployment
- Deployed on **Vercel** (SPA routing configured via `vercel.json`)
- Firebase project: `idatel-cms`

---

## Project Structure

```
idatel-sas/
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── logo-idatel.png        # Default company logo
│   ├── hero-fiber.png         # Hero section background
│   ├── family-bg.png          # Family section background
│   ├── tech-bg.png            # Technology section background
│   └── icons.svg              # Icon sprite
│
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Router setup (public + protected routes)
│   ├── App.css                # Legacy scaffold CSS
│   ├── index.css              # Main stylesheet (1033 lines, custom CSS)
│   ├── firebase.js            # Firebase initialization (Auth, Firestore, Storage)
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Firebase Auth context provider
│   │
│   ├── services/
│   │   └── api.js             # Simulated API (coverage check, WhatsApp link generator)
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx    # Public site (Header, Hero, Features, Tech, Pricing, Coverage, Footer)
│   │   ├── LoginPage.jsx      # Admin login page
│   │   ├── AdminDashboard.jsx # Full admin CMS (~1600 lines)
│   │   └── AboutUs.jsx        # "Sobre Nosotros" page
│   │
│   ├── admin/                 # ⚠️ ORPHANED/UNUSED components
│   │   ├── AdminPanel.jsx     # Broken: references missing components
│   │   └── components/
│   │       └── AccessSettings.jsx  # Broken: imports from nonexistent ../../../config/firebase.js
│   │
│   └── assets/
│       ├── hero.png
│       ├── react.svg
│       └── vite.svg
```

---

## Routing Structure

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | `LandingPage` | Public | Main marketing site |
| `/nosotros` | `AboutUs` | Public | Company history, mission, vision, team |
| `/login` | `LoginPage` | Public | Admin authentication |
| `/admin` | `AdminDashboard` | **Protected** | Full CMS dashboard |
| `*` | Redirect to `/` | - | Fallback |

Protected routes are guarded by `PrivateRoute` component that checks Firebase auth state.

---

## Key Features

### Public Site
- **Header** - Fixed glassmorphism navbar with logo, nav links, mobile hamburger menu, "Contrata Ahora" CTA
- **Hero** - Full-screen section with fiber optic background, gradient overlay, animated floating speed test card
- **Features** - 4-card grid: Symmetric Speed, Extreme Stability, 24h Installation, Local Support
- **Technology Section** - Split layout with infrastructure details
- **Family Section** - Promoting family connectivity
- **Pricing** - Toggle between "Solo Internet" and "Internet + TV" plans (dynamically loaded from Firestore)
- **Coverage Checker** - Form to verify municipality coverage (simulated API against 19 Santander municipalities)
- **Footer** - Multi-column footer with services, company links, contact info, floating WhatsApp button

### Admin Dashboard
- **Plan Management** - CRUD operations for internet plans with search/filter and bulk load of default plans
- **Content Editor** - Visual editor for all site text and images (Inicio, Nosotros, Global tabs). Supports image upload to Firebase Storage with live preview and **delete functionality**
- **Access Settings** - Toggle between email-based or username-alias-based login
- **Company Management** - Edit company history, mission, vision; manage organizational hierarchy levels (up to 5); manage team members with photos, roles, LinkedIn links

### Authentication
- Firebase Email/Password authentication
- Optional username alias system (stored in Firestore `config_acceso` collection)

### WhatsApp Integration
- All plan hiring flows redirect to WhatsApp (`wa.me/573144310460`) with pre-filled message containing selected plan details
- Phone: `+57 (314) 431-0460`

---

## Firebase Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `plans` | Auto-generated | Internet plan documents |
| `content` | `home` | Site-wide text content and image URLs |
| `config_acceso` | `settings` | Login method configuration |
| `empresa` | `datos` | Company info (history, mission, vision, hierarchy levels) |
| `equipo` | Auto-generated | Team member documents |

**Storage paths:** `site/` for site images, `equipo/` for team member photos.

---

## Coverage Area

19 municipalities in Santander department, Colombia:
`simacota`, `la llanita`, `chima`, `contratacion`, `palmar`, `hato`, `galan`, `socorro`, `palmas del socorro`, `confines`, `guapota`, `oiba`, `guadalupe`, `olival`, `tolota`, `vadorreal`, `suaita`, `santana`

---

## Design System

- **Brand Colors:** Netflix Red (`#E50914`) primary, pure black (`#000000`) and dark gray (`#141414`) backgrounds
- **Typography:** Montserrat (Google Fonts), weights 300-900
- **Style:** Dark mode, glassmorphism effects, smooth transitions, animated elements
- **Responsive:** Breakpoints at 576px, 640px, 992px, 1024px, 1100px

---

## Development Conventions

- **JavaScript** (no TypeScript)
- **Custom CSS** (no framework) with CSS variables
- **ESLint** configured with React Hooks and React Refresh plugins
- **React 19** patterns (functional components, hooks)
- **Firebase** for all backend operations (no custom backend)

---

## Known Issues / Technical Debt

1. **Orphaned admin components:** `src/admin/AdminPanel.jsx` and `src/admin/components/AccessSettings.jsx` are unused and broken:
   - `AdminPanel.jsx` imports components (`Dashboard`, `UserManagement`, `Settings`) that don't exist
   - `AccessSettings.jsx` imports from `../../../config/firebase.js` which doesn't exist (real Firebase config is at `src/firebase.js`)
   - The active admin route uses `AdminDashboard.jsx` directly

2. **Coverage API is simulated:** Uses `setTimeout` to simulate network latency. Designed to be replaced with a real backend API later.

3. **No test suite:** No testing framework configured.

4. **Firebase config exposed:** Firebase configuration is hardcoded in `src/firebase.js` (standard for client-side Firebase, but worth noting).

---

## Recent Changes

- **Image deletion functionality:** Added ability to delete uploaded images in the "Imágenes y Texto" section. When an image is deleted, it's removed from Firebase Storage and the default image is restored.
- **Plan form cancel fix:** The "Cancelar" button in plan editing now properly clears all form fields instead of just exiting edit mode.
