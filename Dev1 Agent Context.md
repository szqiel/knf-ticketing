# Dev1 Agent Context

> **Document Version**: 1.0.0  
> **Last Updated**: October 15, 2026  
> **Role**: Dev 1 (Lead Frontend Developer & UI/UX Specialist — KNF26 Ticketing Platform)  
> **Purpose**: Single source of truth containing all conversational history, architectural decisions, completed work, bugs/mistakes encountered, technical lessons learned, and the forward-looking roadmap.

---

## 1. Project Overview & Aesthetic Identity

### 1.1 Project Summary
**KNF26** is a dedicated festival ticketing and seat reservation kiosk platform built for the **Kineforum Film Festival 2026**.
- **Scale**: 1 Cinema Hall, ~500 seats (`SEAT.png`), 8 distinct curated festival screening programs across 2 days.
- **Ticketing Model**: **100% Free Seat Reservation** (strictly **1 seat per audience** per transaction; no payment gateway integration).
- **Access Flow**: Gate entrance via staff-displayed rotating QR code (`/admin/qr`) unlocking a 5-minute booking session on mobile/kiosk.
- **Seat Concurrency**: 3-minute atomic hold in PostgreSQL broadcasted in real time via Server-Sent Events (SSE).
- **Proof of Admission**: High-fidelity digital ticket card ("Selamat Bersinema!") screenshot verified by staff at the cinema door.

### 1.2 Aesthetic Identity: Authentic Frutiger Aero & Y2K Aqua
The entire application adheres to an authentic **Frutiger Aero / Windows XP / Aqua** visual language:
- **Glossy Specular Highlights**: Two-tone and multi-tone bevel reflections (`inset 0 1px 1px #fff`, `inset 0 -2px 4px rgba(...)`).
- **Chrome Typography**: Multi-stop metallic linear gradients, hard 3D drop shadows (`0 4px 0 #000a69`), deep navy blue strokes (`#000a69`), and glossy equator splits.
- **Skeuomorphic Jelly Buttons**: Pill-shaped glossy buttons with bright inner bevels, gradient borders, and reactive hover/press physics.
- **Environmental Theming**: Sky-blue gradients, butter-yellow modal cards, translucent frosted-glass panels, and bliss meadow wallpapers.

### 1.3 Core Tech Stack
- **Framework**: Next.js 16.4.0 (App Router, Turbopack default, React Compiler enabled, Partial Prerendering).
- **Runtime & UI**: React 19.3, TypeScript 5.8+, CSS Modules for scoped Aqua primitives, Tailwind CSS v4 for administrative layouts.
- **Database & ORM**: PostgreSQL 16 + Drizzle ORM.
- **Realtime Engine**: PostgreSQL `LISTEN / NOTIFY` via Server-Sent Events (SSE) `/api/programs/[id]/stream`.
- **Infrastructure**: Standalone Docker container (`output: 'standalone'`), Coolify VPS deployment, Traefik reverse proxy.
- **Testing & QA**: Playwright for end-to-end booking tests, k6 for concurrent seat hold stress testing.

---

## 2. Team Structure & Division of Responsibilities

```mermaid
flowchart TD
  subgraph Dev1["Dev 1 (Lead Frontend / Visual 1:1 Specialist)"]
    D1_Tokens["Design Tokens & Typography (tokens.css)"]
    D1_Primitives["Core Aqua UI Primitives & /dev/gallery"]
    D1_Home["Screen 1: Home Showcase (/) — 8 Program Cards"]
    D1_Detail["Screen 2: Program Detail (/p/[slug]) — Hero & Film Lineup"]
    D1_Modal1["Overlay 1: Film Detail Modal (Frame 5) — Yellow Card"]
    D1_Modal2["Overlay 2: No Seats Available Modal (Frame 7) — Blue Card"]
    D1_CMS["Content CMS (/admin/programs) — Film CRUD & WebP Compression"]
  end

  subgraph Dev2["Dev 2 (Backend, Ops & Realtime Specialist)"]
    D2_DB["PostgreSQL 16 Schema, Migrations & Drizzle ORM"]
    D2_Contracts["API Contracts, Zod Validation & Hold Engine"]
    D2_SSE["SSE Realtime Seat Blocker & Live Updates"]
    D2_Admin["Admin Operational Panel (/admin) & Staff Auth"]
    D2_Reports["Audit Reports, Excel (.xlsx) & PDF Export"]
    D2_DevOps["Production Dockerfile, Coolify Config & CI Tests"]
  end

  D1_Tokens --> D2_Admin
  D2_Contracts --> D1_Detail
  D2_SSE --> D1_Modal2
```

### Dev 1 Ownership
- Visual fidelity 1:1 with Figma.
- Public browsing & discovery flows (`/`, `/p/[slug]`).
- Overlay modals (`FilmDetailModal`, `NoSeatsModal`).
- Responsive kiosk scaling (`--kiosk-scale` on 1195px venue laptops).
- SVG typography rendering engine for chrome reflection titles.

### Dev 2 Ownership
- Database persistence, seed scripts, migrations.
- Admin authentication (HTTP-only signed cookies, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`).
- Realtime seat hold engine with race-condition prevention (Postgres advisory locks & transactions).
- Admin operational dashboard (`/admin`), audience management, manual seat blocking/unblocking.
- Excel (`exceljs`) and PDF (`@react-pdf/renderer`) reporting.
- Docker standalone packaging and load/e2e testing suite.

---

## 3. Implementation Status & Feature Audit

| Screen / Feature | Route / Component | Figma Reference | Status | Notes |
|---|---|---|---|---|
| **Design Tokens & Typography** | `styles/tokens.css`, `app/globals.css` | Global Tokens | **100% Done** | Colors, bevels, drop shadows, dynamic `--kiosk-scale` |
| **Aqua Primitives Gallery** | `/dev/gallery`, `components/aqua/*` | Primitives | **100% Done** | GelButton, GlossCard, GlassPill, DisplayTitle, Badge, Modal, Stepper |
| **Screen 1: Home Showcase** | `app/page.tsx`, `components/home/*` | `113:226` | **100% Done** | 8 program cards, active & sold out states, poster boxes |
| **Screen 2: Program Detail** | `app/p/[slug]/page.tsx`, `components/program/*` | `102:203` | **100% Done** | Hero poster, time pill, lineup subheader, 3-column film grid |
| **Overlay 1: Film Detail Modal** | `components/program/FilmDetailModal.tsx` | `132:467`, `Frame 5` | **100% Done** | Butter-yellow card, 2:3 poster, 16:9 still, 50% split chrome title |
| **Overlay 2: No Seats Available** | `components/booking/NoSeatsModal.tsx` | `171:256`, `Frame 7` | **100% Done** | Icy-blue card, red jelly close button, chrome SVG title, schedule pill |
| **Screen 3: Interactive Seat Map** | `app/p/[slug]/seats/page.tsx`, `components/booking/SeatMap.tsx` | `102:757`, `174:10921` | **85% Functional** | Functional SVG 500-seat map with live hold, needs 1:1 visual polish pass |
| **Overlay 3: Identity Form Overlay** | `components/booking/YourDetailsModal.tsx` | `132:1413` | **80% Functional** | Form inputs name/whatsapp/email, needs 1:1 Figma styling polish |
| **Screen 4: Ticket Confirmation** | `app/p/[slug]/done/[id]/page.tsx`, `components/booking/SuccessTicket.tsx` | `102:1187` | **85% Functional** | 30s countdown bar, booking ID display, needs visual ticket alignment |
| **Admin Operations** | `/admin`, `/api/admin/*` | N/A (Dev 2) | **100% Done** | Staff login, audience list, seat blocker, Excel/PDF export |
| **Content CMS** | `/admin/programs` | Step 7 Roadmap | **Planned** | Drag-and-drop film reordering, WebP image upload |

---

## 4. Workflows & Operating Protocols

### 4.1 Figma MCP Selection-Only Protocol
- **Hard Rule**: Never query the full Figma canvas root (`node-id=1:3`). Full-canvas queries dump millions of AST nodes, exceeding token limits and exhausting Figma API quotas.
- **Protocol**: 
  1. Dev selects the specific frame in Figma (<kbd>Ctrl</kbd> + <kbd>L</kbd>).
  2. Agent calls `figma.get_figma_data` with the specific `nodeId`.
  3. When API quotas must be conserved, use pre-extracted AST logs (e.g. `figma_output_dialog_171-256.txt`) or prototype HTML files (e.g. `scratch/figma-dialog/index.html`).

### 4.2 The 3-Pass Component Build Process
1. **Pass 1: Structure & Shell**: DOM hierarchy, CSS grid/flexbox, responsive layout, TypeScript props.
2. **Pass 2: Micro-Styling & Aqua Polish**: Refine multi-stop gradients, bevels, SVG text strokes, specular shines, and drop shadows in `/dev/gallery`.
3. **Pass 3: State & Contract Wiring**: Connect to API, handle keyboard navigation (ESC, Tab traps), loading skeletons, error toasts, and route transitions.

### 4.3 Git Conventional Commit Standards
Every commit must strictly follow conventional commits with bullet points explaining the technical rationale:
```git
<type>(<scope>): <title>
- <bullet 1: core change>
- <bullet 2: detail on styling or logic>
- <bullet 3: responsive or verification detail>
```

---

## 5. Critical Decisions & Technical Choices

### 5.1 SVG `<text>` Typography vs. CSS `-webkit-text-stroke`
- **The Challenge**: Frutiger Aero display titles require simultaneously:
  1. Multi-stop vertical gradient fills (e.g. White $\rightarrow$ Chrome Blue or White $\rightarrow$ Yellow).
  2. Multi-stop metallic border strokes (e.g. Royal Blue with specular cyan/white hairline reflection).
  3. Hard 3D offset drop shadows (`0 4px 0 #000a69`).
- **The Decision**: CSS properties `-webkit-text-stroke` and `text-shadow` render unpredictably across browsers (strokes clip internal text fills, drop shadows apply to text before stroke, and gradient borders on text are completely unsupported in CSS standards).
- **The Solution**: All display titles are built with scoped SVG `<text>` elements utilizing:
  - `<linearGradient>` with `gradientUnits="objectBoundingBox"`
  - `paintOrder="stroke fill"` (places the thick stroke cleanly behind glyph contours)
  - `<filter>` `<feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#000A69" />`
  - Dynamic `useId()` prefixes to avoid SVG `id` collisions across concurrent modals.

### 5.2 Dynamic Kiosk Scaling (`--kiosk-scale`)
- **The Challenge**: The venue kiosk laptops operate at 1195px designed canvas width, but attendees also browse on 1366×768 laptops, 1920×1080 desktops, and mobile smartphones (< 680px).
- **The Solution**: Global layout scales dynamically with CSS clamp and CSS variables, allowing full-width cards on mobile without horizontal clipping, and fixed pixel-perfection on kiosk display screens.

### 5.3 CSS Modules Over Tailwind CSS for Glossy Primitives
- Tailwind CSS v4 is used for standard administrative layouts (`/admin`), but all public-facing Aqua UI components use scoped CSS Modules (`*.module.css`).
- **Rationale**: Highly layered skeuomorphic styles requiring multiple nested gradients (`padding-box` vs `border-box`), multiple inset box-shadows, and SVG filters cannot be cleanly expressed in utility classes without unmaintainable arbitrary string soup.

---

## 6. Mistakes Encountered & Lessons Learned

### 5.4 Screen 3: Interactive Cinema Seat Map (`/p/[slug]/seats`)
- **Total Canonical Seats**: **506 seats** (250 Upper A–H, 256 Lower J–S).
- **Seat Numbering**: From screen right-to-left (e.g., A1 is the rightmost front seat, A29 is the leftmost front seat).
- **VIP/Front-Center Reserved Blocks**: `A10–20`, `B10–21`, `C10–22`, `D10–22` (49 seats total) reserved and locked to sold/blocked.
- **Progressive Rear-Row Unlock Logic**: Rear rows `J–S` (256 seats) remain blocked until cumulative occupied front seats (`A–H`) reach $\ge 150$.
- **Strict Audience Privacy Constraint**:
  - **No visual notices, banners, or lock explanations** on the audience booking screen.
  - Audiences simply see rear seats as regular gray sold seats without knowing internal gating thresholds.
  - Validation is strictly enforced on the backend (`holdSeat` transaction rejects rear seats before 150 front seats are held/sold).
- **Floating Confirmation Bar (1:1 Figma node `102:962` & `174:14496`)**:
  - **Container**: `borderRadius: 10px`, `padding: 10px 10px 10px 28px`, `background: linear-gradient(0deg, rgba(113, 118, 168, 1) 0%, rgba(0, 10, 105, 1) 12%, rgba(0, 21, 207, 1) 100%)`.
  - **Eyebrow**: `"YOUR SEATS"` (Arial 900 Black, 10.4px, uppercase, letter-spacing 0.13em, `#ffffff`).
  - **Seat Label**: `"None selected"` / `${seat.label}` (Arial 700 Bold, 16px, `#ffffff`).
  - **Count**: `"0 seats"` / `"1 seat"` (Arial 400 Regular, 12.8px, `#e7e7e3`).
  - **Idle Button (`102:970`)**: Height 60.8px, border radius 16px, border `1.6px solid #fff`, background `linear-gradient(180deg, #e7e7e3 33%, #a9a9a9 76%, #d5d5d5 99%)`, text gradient `linear-gradient(90deg, #000a69 0%, #0015cf 100%)`.
  - **Hovered / Active Button (`174:14504`)**: Height 60.8px, border radius 16px, border `1.6px solid #fff`, background `linear-gradient(180deg, #0015cf 33%, #000a69 76%, #808cff 99%)`, text `#ffffff`.
  - **Scroll Following & Non-Overlap Architecture**:
    - **Why `position: sticky` failed**: Ancestor `.page` had `overflow-x: hidden`, which in browser CSS creates an overflow clipping container that disables viewport sticky tracking. Additionally, sticky inside a flex shell stops sticking at the parent boundary.
    - **The Solution**: Bar uses `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 50;`. This guarantees the bar **always floats and follows the scroll** seamlessly across the entire viewport.
    - **Preventing Bottom Row Overlap**:
      - A companion `<div className={styles.bottomRailSpacer} />` (height 90px on desktop, 76px on tablet, 64px on mobile) is rendered in document flow right below the shell.
      - `.cinemaCanvas` bottom padding is set to `8.5rem` (~136px), and `.stage` bottom padding to `6rem`.
      - When audiences scroll all the way to the end, Row S seats are located > 160px safely ABOVE the confirmation bar.
      - `.page` uses modern `overflow-x: clip;` instead of `overflow-x: hidden`.

---

## 6. Known Pitfalls, Mistakes & Technical Lessons Learned

### 6.1 Static Height Overrides Breaking Aspect Ratios (Film Posters & Stills)
- **Mistake**: When initially implementing `FilmDetailModal.tsx`, a fixed height (`min-height: 585px`) was set on the poster column, and fixed `height: 208px` on the still photo box. This stretched 2:3 portrait posters into awkward 1:2 vertical strips, and distorted 16:9 widescreen stills into ultra-wide banners.
- **Lesson**: Never use static pixel heights for media frames. Use standard CSS `aspect-ratio: 2 / 3` for film posters and `aspect-ratio: 16 / 9` for widescreen video stills, paired with `max-width` and `object-fit: cover`.

### 6.2 Chrome Gloss Reflection Split (30% vs. 50%)
- **Mistake**: In SVG `<text>` linear gradients, vertical percentages map to the entire font bounding box (including ascenders, cap height, baseline, and descenders). Setting a gloss transition stop at `30%` caused the specular light line to sit above the x-height of lowercase letters. As a result, letters like "o", "r", "e", "s", "a", "n" remained entirely dark blue, with only "G" and "S" tips catching the light.
- **Lesson**: To achieve an authentic Frutiger Aero half-gloss chrome text, position the transition line at **46% to 50%** of the vertical gradient with a crisp `#FFFFFF` hairline shine (`46% #8993eb` $\rightarrow$ `49% #ffffff` $\rightarrow$ `50% #0015cf`). This bisects the vertical equator of both capital and lowercase letters evenly.

### 6.3 Flex Child Horizontal Centering (`align-self: center`)
- **Mistake**: In `FilmDetailModal`, when `.stillPhotoBox` was constrained with `max-width: 480px`, it was placed inside `.infoColumn` (`display: flex; flex-direction: column`). Because flex children default to `align-self: stretch` but max-width caps expansion, browsers align the element to `flex-start` (left), leaving an asymmetrical 90px void on the right side.
- **Lesson**: When capping the width of a block inside a flex column, always explicitly declare `align-self: center; margin: <Y> auto 0 auto;` to guarantee horizontal centering across all screen sizes.

### 6.4 Dev Server Cache Conflicts (`next dev` vs. `npm run build`)
- **Mistake**: Running `npm run build` while `next dev` (with Turbopack) is actively serving port 3000 caused the local server to serve stale in-memory JavaScript bundles. When testing `NoSeatsModal`, the browser continued displaying an old stub ("Yah, kursinya sudah habis") because the client bundle was cached in browser memory.
- **Lesson**: When testing visual modal updates, always instruct or perform a **hard refresh** (`Ctrl + Shift + R` / `Ctrl + F5`) or clear client-side cache to ensure Turbopack delivers the fresh bundle.

---

## 7. Configuration & Environment Reference

### 7.1 Required Local Secrets (`.env.local`)
> *Never commit `.env.local` to Git.*
```ini
# PostgreSQL Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/knf26_ticketing"

# Admin Authentication
ADMIN_PASSWORD="password-staff"
ADMIN_SESSION_SECRET="random-panjang-dan-aman-minimal-32-karakter"

# Next.js Settings
NEXT_TELEMETRY_DISABLED=1
```

### 7.2 Active Figma References
- **File Key**: `ze8N0sEcHt7GRIXyoam9wl`
- **Key Node IDs**:
  - Home Showcase: `#113:226`
  - Program Detail & Film Line-Up: `#102:203`
  - Film Detail Modal (Yellow Card): `#132:467`
  - No Seats Available Modal (Blue Card): `#171:256`
  - Interactive Seat Map: `#102:757` / `#179:18142`
  - Form Overlay: `#132:1413`
  - Success State ("Selamat Bersinema!"): `#102:1187`

---

## 8. Immediate Next Steps (Priority Order)

1. **Overlay 3: Identity Form Overlay (`132:1413`)**:
   - Match input fields (Full Name, WhatsApp/Instagram, Email) to the Figma modal layout.
   - Wire atomic hold verification and submission error handling.
2. **Screen 4: Ticket Confirmation Screen (`102:1187`)**:
   - Apply the celebratory gradient background, ticket card pass with QR code, and 30-second countdown auto-return progress bar.
3. **Step 7: Content CMS (`/admin/programs`)**:
   - Film line-up drag-and-drop reordering with `@hello-pangea/dnd` and poster image upload with WebP compression via `sharp`.
