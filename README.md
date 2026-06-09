# 📰 Banshi Express (বংশী এক্সপ্রেস)

An enterprise-grade, ultra-secure, and lightning-fast real-time news portal built with **Next.js 14/15 (App Router)** and **Supabase**. This system features an advanced multi-layered architecture separating the public-facing news aggregation client from a high-performance administrative command center.

---

## 🚀 Core Features

### 👤 Public User Interface
* **Dynamic Layout & Responsive Grid:** Features an international-standard hero feature layout with masonry fallback grids for standard news categories.
* **Real-time Animated Breaking Ticker:** An optimized, interactive CSS-marquee breaking news bar with automated pausing state on hover.
* **Instant Multi-Language Engine:** Client-side localization state enabling zero-refresh translation swapping between English and Bengali (`bn` / `en`).
* **Live District-Based Filtering:** State-driven, client-side relational sorting that filters down global news feeds into localized district-level data instantaneously without page reloads.
* **Intelligent Related Feed Generation:** Detail view context engine that calculates and fetches contextual category-archived stories for maximum user retention.

### ⚙️ Administrative Console (`/admin`)
* **Secure Authentication Gateway:** Fully-integrated stateful authentication backed by Supabase Auth with custom lifecycle listeners.
* **Live Metrics Dashboard:** High-fidelity tracking overview detailing database transaction totals, global archives, and regional distribution nodes.
* **Inline Multi-Lingual CRUD Studio:** Real-time dual-language management allowing data insertion, live-search filtering, and instantaneous server synchronization.
* **Real-Time Modification Previewer:** A dual-pane canvas that renders an accurate visual mockup of the finalized layout as the administrator types, utilizing synthetic DOM fallback images.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js (App Router) utilizing React Server Components (RSC) and Client Components strategically for optimal hydration performance.
* **Database & Auth:** Supabase (PostgreSQL under-the-hood) with structural foreign key constraints between News, Categories, and Districts tables.
* **Styling:** Tailwind CSS combined with fluid animations (`framer-motion` ready paradigms).
* **Build Pipeline:** Next.js Turbopack engine for microsecond Hot Module Replacement (HMR).

---

## 📂 Project Directory Structure

```text
news-portal/
├── src/
│   ├── app/
│   │   ├── (user)/           # 👤 Public User Portal (Route Group)
│   │   │   ├── category/     # Dynamic Category Archives
│   │   │   ├── news/         # Dynamic Single Story Layouts
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      # Main Aggregate Landing Page
│   │   ├── admin/            # ⚙️ Protected Administrative Engine
│   │   │   ├── categories/   # Multi-Lingual Category Engine
│   │   │   ├── districts/    # Regional Mapping Studio
│   │   │   ├── news/         # Core Content Manager & Edit Wizards
│   │   │   └── layout.tsx    # Session-Locked Layout Router
│   │   ├── globals.css
│   │   └── layout.tsx
│   └── lib/
│       └── supabase.ts       # Database Pool Initializer
├── public/
├── .env.local                # Local Secret Stores
├── package.json
└── README.md



⚙️ Local Development SetupTo replicate this engine on your local terminal environment, follow these execution protocols:1. Clone the ArchitectureBashgit clone [https://github.com/your-username/news-portal.git](https://github.com/your-username/news-portal.git)
cd news-portal
2. Dependency AggregationBashnpm install
3. Environment AllocationCreate a .env.local file inside the root directory and input your remote database endpoints:Code snippetNEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
4. Execute Native Compiler EngineBashnpm run dev
Open http://localhost:3000 inside your modern web browser to interact with the runtime application instances.📐 Database Schema BlueprintThe Postgres storage array leverages structured dimensional mappings ensuring optimal relational joins:TableCore PillarsArchitectural Responsibilitynewsid, title, content, excerpt, image_url, category_id, district_id, is_published, is_breakingPrimary storage engine containing localized markdown content data payloads.categoriesid, name_bn, name_en, slugSemantic taxonomic nodes mapped into URL sub-routes for classification.districtsid, name_bn, name_en, slugRegional geospatial tagging maps to enable accurate sub-metro localized queries.🚀 Production Deployment ProtocolsThis repository is calibrated for standard production deployment arrays via the Vercel Edge Network:Push production code to a primary branch (main).Map repository pipelines inside the Vercel Deploy Board.Bind identical .env.local structural keys into Vercel's Environment Variables Settings panel.Crucial Access Configuration: Update your Site URL parameter within your Supabase project's Authentication -> URL Configuration directory to match your live production address to allow production-grade administrative credential handshakes.📄 LicenseThis system architecture is protected and maintained under the MIT License. Feel free to branch and expand the scope of this implementation framework.Engineered to reflect truth, precision, and speed — The Banshi Express Core.