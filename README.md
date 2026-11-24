# StockFlow – Inventory Management System

StockFlow is a commercial-grade, full-stack Software-as-a-Service (SaaS) Inventory Management System designed with clean software architecture principles and a minimal, restrained user interface inspired by Stripe Dashboard, Linear, and Vercel.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18
- **Bundler & Tooling**: Vite
- **Routing**: React Router (v7)
- **Styling**: Tailwind CSS (Utility-first, zinc neutral palette, single blue accent)
- **Networking**: Axios (Typed response interceptors & unified error mapping)
- **Icons**: Lucide React (Uniform 16px stroke geometry)

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **ORM & Data Layer**: SQLAlchemy 2.0 (Declarative Base, pre-ping connection pool)
- **Migrations**: Alembic
- **Validation**: Pydantic v2 & Pydantic Settings
- **Database Engine**: PostgreSQL (psycopg2-binary)

---

## 📂 Project Architecture

```text
StockFlow/
├── backend/
│   ├── alembic/                         # Database schema migrations
│   │   ├── versions/                    # Version delta scripts
│   │   ├── env.py                       # Migration runtime harness
│   │   └── script.py.mako               # Template
│   ├── app/
│   │   ├── core/                        # Configuration & environment loader
│   │   │   ├── config.py                # Pydantic BaseSettings (.env)
│   │   │   └── security.py              # Cryptographic & credential stubs
│   │   ├── database/                    # SQLAlchemy database engine
│   │   │   ├── base.py                  # Declarative base model
│   │   │   └── session.py               # Engine & sessionmaker dependency
│   │   ├── models/                      # Database entities (SQLAlchemy)
│   │   ├── schemas/                     # Data transfer objects (Pydantic)
│   │   ├── routes/                      # API endpoint controllers
│   │   │   └── health.py                # GET /api/health
│   │   ├── services/                    # Business logic & repository services
│   │   ├── utils/                       # Common helper utilities
│   │   │   └── helpers.py               # Response payload formatters
│   │   ├── __init__.py
│   │   └── main.py                      # FastAPI app entry point & CORS
│   ├── .env                             # Local environment variables
│   ├── .env.example                     # Environment template
│   ├── .gitignore                       # Backend git exclusion rules
│   ├── alembic.ini                      # Alembic CLI configuration
│   └── requirements.txt                 # Python dependencies
│
├── frontend/
│   ├── public/                          # Static public assets
│   ├── src/
│   │   ├── assets/                      # Application image & vector assets
│   │   ├── components/                  # Atomic & shared UI components
│   │   │   ├── Badge.jsx                # Neutral/compact state pill
│   │   │   └── Header.jsx               # Stripe-style top navigation & API ping monitor
│   │   ├── layouts/                     # Layout shells
│   │   │   └── AppLayout.jsx            # Standard application wrapper
│   │   ├── pages/                       # Route views
│   │   │   └── SystemOverviewPage.jsx   # Technical architecture & health overview
│   │   ├── services/                    # HTTP client integrations
│   │   │   ├── api.js                   # Axios client with interceptors
│   │   │   └── healthService.js         # API health service caller
│   │   ├── context/                     # Shared React state providers
│   │   │   └── SystemContext.jsx        # Live backend status provider
│   │   ├── hooks/                       # Custom hooks
│   │   │   └── useHealth.js             # Hook to access backend status
│   │   ├── utils/                       # Frontend helper functions
│   │   │   └── formatters.js            # Date & class name formatters
│   │   ├── App.jsx                      # Router & layout provider root
│   │   ├── index.css                    # Tailwind CSS directives & typography
│   │   └── main.jsx                     # React entry point
│   ├── .env                             # Local frontend environment variables
│   ├── .env.example                     # Environment template
│   ├── .gitignore                       # Frontend git exclusion rules
│   ├── index.html                       # HTML5 template
│   ├── package.json                     # Frontend dependencies
│   ├── postcss.config.js                # PostCSS configuration
│   ├── tailwind.config.js               # Tailwind design system configuration
│   └── vite.config.js                   # Vite configuration with path aliases
│
├── .env.example                         # Root environment template
├── .gitignore                           # Workspace git exclusion rules
└── README.md                            # Documentation
```

---

## 🚀 Running the Applications on Windows PowerShell

Frontend and backend run completely independently. Open two separate Windows PowerShell windows.

### Terminal 1: Backend (FastAPI)

```powershell
# 1. Navigate to the backend directory
cd "c:\Users\KANTHU NAIK\OneDrive\Desktop\StockFlow\backend"

# 2. Activate the virtual environment
.\venv\Scripts\Activate.ps1

# 3. Start the FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **Health Endpoint**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative Documentation (ReDoc)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Terminal 2: Frontend (React + Vite)

```powershell
# 1. Navigate to the frontend directory
cd "c:\Users\KANTHU NAIK\OneDrive\Desktop\StockFlow\frontend"

# 2. Start the Vite development server
npm run dev
```

- **Frontend Application URL**: [http://localhost:5173](http://localhost:5173)

---

## 🎨 Visual Design System Guidelines

- **Surfaces**: White (`#ffffff`) and zinc neutrals (`#fafafa`, `#f4f4f5`) with 1px border lines (`#e4e4e7`).
- **Typography**: Inter/system font stack, charcoal text (`#18181b`), muted descriptions (`#71717a`).
- **Accent**: One consistent blue accent (`#2563eb`).
- **Geometry**: Compact border radii (`rounded-md`, 6px), consistent 16px (`w-4 h-4`) icons.
- **Tone**: Authentic product language, eliminating placeholder fluff, fake statistics, and unnecessary animations.
