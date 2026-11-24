# StockFlow – Inventory Management System

A modern, full-stack, decoupled SaaS Inventory Management System designed for performance, modularity, and enterprise scalability.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [React.js](https://react.dev/) (v18)
- **Build Tool**: [Vite](https://vitejs.dev/) (Fast HMR & bundled ESM)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Responsive, utility-first)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance async Python framework)
- **ASGI Server**: [Uvicorn](https://www.uvicorn.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Schema Validation**: [Pydantic v2](https://docs.pydantic.dev/) & Pydantic Settings
- **Database Migrations**: [Alembic](https://alembic.sqlalchemy.org/)

---

## 📁 Project Structure

```text
StockFlow/
├── backend/                       # Python + FastAPI backend application
│   ├── alembic/                   # Alembic database migrations
│   │   ├── versions/              # Migration revision scripts
│   │   ├── env.py                 # Migration runtime configuration
│   │   └── script.py.mako         # Migration script template
│   ├── app/                       # Application source code
│   │   ├── core/                  # Core configurations & security settings
│   │   │   ├── config.py          # Pydantic BaseSettings & env loader
│   │   │   └── security.py        # Hashing & auth utility stubs
│   │   ├── database/              # SQLAlchemy session & base declarative models
│   │   │   ├── base.py            # Base declarative class
│   │   │   └── session.py         # DB engine & get_db dependency
│   │   ├── models/                # SQLAlchemy database entities
│   │   │   └── item.py            # Inventory item table model
│   │   ├── schemas/               # Pydantic validation & serialization models
│   │   │   ├── health.py          # Health check response schema
│   │   │   └── item.py            # Item request/response schemas
│   │   ├── services/              # Business logic & repository services
│   │   │   └── inventory_service.py # Inventory operations service
│   │   ├── routes/                # FastAPI API endpoint routers
│   │   │   ├── api.py             # Router aggregation
│   │   │   ├── health.py          # /api/v1/health endpoint
│   │   │   └── items.py           # /api/v1/items endpoints
│   │   ├── __init__.py
│   │   └── main.py                # FastAPI app initialization & CORS setup
│   ├── .env.example               # Backend environment variables template
│   ├── .gitignore                 # Backend-specific gitignore
│   ├── alembic.ini                # Alembic CLI configuration
│   └── requirements.txt           # Python backend dependencies
│
├── frontend/                      # React + Vite frontend application
│   ├── src/                       # Frontend source code
│   │   ├── components/            # Reusable UI components
│   │   │   └── common/            # Shared components (Navbar, Sidebar, StatCard, StatusBadge)
│   │   ├── pages/                 # Full view pages (Dashboard, Inventory)
│   │   ├── layouts/               # Page wrapper layouts (MainLayout)
│   │   ├── services/              # API clients & backend communication (Axios)
│   │   ├── context/               # React Context providers (AppContext)
│   │   ├── hooks/                 # Custom React hooks (useInventory)
│   │   ├── App.jsx                # Main application component & tab router
│   │   ├── index.css              # Tailwind CSS directives & global styling
│   │   └── main.jsx               # React DOM entry point
│   ├── .env.example               # Frontend environment variables template
│   ├── .gitignore                 # Frontend-specific gitignore
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies & npm scripts
│   ├── postcss.config.js          # PostCSS configuration
│   ├── tailwind.config.js         # Tailwind theme & color configurations
│   └── vite.config.js             # Vite bundler & path alias configuration
│
├── .env.example                   # Global environment variables template
├── .gitignore                     # Global workspace gitignore
└── README.md                      # Project documentation & setup instructions
```

---

## 🛠️ Getting Started

Frontend and backend run completely independently.

### 1. Backend Setup

#### Prerequisites
- Python 3.10+
- PostgreSQL (optional for initial mock/testing, required for persistent storage)

#### Installation & Execution
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\venv\Scripts\activate.bat
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env   # Windows
# or cp .env.example .env (Linux/macOS)

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Documentation (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **API Health Check**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

#### Database Migrations (Alembic)
Once your PostgreSQL instance is running and configured in `backend/.env`:
```bash
# Generate a migration from SQLAlchemy models
alembic revision --autogenerate -m "Create initial tables"

# Apply migrations
alembic upgrade head
```

---

### 2. Frontend Setup

#### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm / yarn

#### Installation & Execution
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
copy .env.example .env   # Windows
# or cp .env.example .env (Linux/macOS)

# Start the Vite development server
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)

---

## 🔌 API Endpoints (Initial Release)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root service info |
| `GET` | `/api/v1/health` | Service health status & configuration |
| `GET` | `/api/v1/items` | List inventory items (paginated) |
| `POST` | `/api/v1/items` | Create a new inventory item |
| `GET` | `/api/v1/items/{id}` | Retrieve item details by ID |

---

## 📄 License
Private SaaS application - StockFlow.
