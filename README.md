# AgriPrice 🌾 — ಕೃಷಿ ಬೆಲೆ

**AI-powered agricultural market intelligence platform for Karnataka farmers.**

Real-time APMC mandi prices · XGBoost price predictions · Weather impact analysis · Government schemes · Bilingual (English + Kannada)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 16 |
| ML | XGBoost + Scikit-learn + Pandas |
| Cache | Redis 7 |
| Auth | JWT (access + refresh tokens) |
| Data | Agmarknet API + eNAM + OpenWeather |
| Maps | OpenStreetMap (iframe embed) |
| Deploy | Docker + Docker Compose |

---

## Project Structure

```
agriprice/
├── frontend/                   # React + Vite app
│   ├── src/
│   │   ├── pages/              # 18 page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LivePricesPage.jsx
│   │   │   ├── CropsPage.jsx
│   │   │   ├── CropDetailPage.jsx
│   │   │   ├── AIPredictionPage.jsx
│   │   │   ├── APMCMarketsPage.jsx
│   │   │   ├── MarketTrendsPage.jsx
│   │   │   ├── WeatherPage.jsx
│   │   │   ├── FarmerInfoPage.jsx
│   │   │   ├── GovernmentSchemesPage.jsx
│   │   │   ├── MSPPage.jsx
│   │   │   ├── HelpCenterPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── components/layout/  # Navbar, Footer, Layout
│   │   ├── context/            # Zustand auth store
│   │   └── utils/              # Axios API client
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                    # FastAPI app
│   ├── main.py                 # App entry point + router registration
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic settings
│   │   │   ├── database.py     # Async SQLAlchemy + session
│   │   │   └── security.py     # JWT + bcrypt + OAuth2
│   │   ├── models/
│   │   │   └── user.py         # SQLAlchemy ORM models
│   │   ├── routers/
│   │   │   ├── auth.py         # Register / login / refresh
│   │   │   ├── crops.py        # Crop listing + detail
│   │   │   ├── prices.py       # Latest prices + history + ticker
│   │   │   ├── markets.py      # APMC markets + nearest
│   │   │   ├── predictions.py  # XGBoost AI recommendation
│   │   │   ├── schemes.py      # Government schemes + MSP
│   │   │   ├── users.py        # Profile + saved crops + notifications
│   │   │   └── weather.py      # OpenWeather district forecast
│   │   ├── ml_pipeline.py      # XGBoost training pipeline
│   │   └── data_fetcher.py     # Agmarknet data ingestion + scheduler
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── database/
│   └── schema.sql              # Full PostgreSQL schema
│
├── ml/models/                  # Trained model artifacts (gitignored)
│   ├── xgb_price_model.joblib
│   └── feature_scaler.joblib
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
# 1. Clone and enter project
git clone <repo-url> agriprice && cd agriprice

# 2. Copy and configure environment
cp .env.example backend/.env
# Edit backend/.env with your API keys (optional for dev)

# 3. Start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL
createdb agriprice
psql agriprice < ../database/schema.sql

# Configure environment
cp .env.example .env  # fill in DATABASE_URL etc.

# Start server
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create farmer account |
| POST | `/api/auth/login` | Login → JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/prices/latest` | Today's APMC prices |
| GET | `/api/prices/ticker` | 20 prices for scrolling ticker |
| GET | `/api/prices/history/{crop_id}` | Price trend over N days |
| GET | `/api/crops` | All 60+ crops |
| GET | `/api/crops/{id}` | Crop detail |
| GET | `/api/crops/{id}/prices` | Crop price history |
| GET | `/api/markets` | All APMC markets |
| GET | `/api/markets/nearest?lat=&lng=` | Markets sorted by GPS distance |
| POST | `/api/predictions/recommend` | 🔒 AI price recommendation |
| GET | `/api/weather/district/{id}` | 5-day district forecast |
| GET | `/api/schemes` | Government schemes |
| GET | `/api/schemes/msp` | MSP prices 2024-25 |
| GET | `/api/users/me` | 🔒 User profile |
| GET | `/api/users/me/saved-crops` | 🔒 Saved crops |

🔒 = requires JWT Bearer token

---

## Features

### Live Prices
- 200+ APMC markets, 60+ crops
- Filter by district, category, MSP status
- Table and card views
- Price change indicators vs previous day
- Arrivals in tonnes

### AI Prediction
- XGBoost model trained on 5 years Karnataka APMC data
- Recommendations: SELL_TODAY / HOLD / WAIT_2_DAYS / GOVT_PROCUREMENT
- Confidence score and reasoning
- 7-day price trend chart
- Market comparison (up to 3 nearest markets)
- Revenue estimate for entered quantity

### APMC Markets
- All 18 major Karnataka APMCs with GPS coordinates
- "Find Nearest" — geolocation-based distance sorting
- Crop list, trading hours, phone numbers
- OpenStreetMap embed, Google Maps directions link

### Market Trends
- Seasonal price charts (12-month) for 4 major crops
- Arrivals volume bar chart
- Multi-market price comparison
- Multi-crop overlay line chart
- Best month to sell analysis

### Weather
- 5-day forecast per district
- Crop impact alerts (AI-generated)
- All-districts overview grid

### Government Schemes
- 10 major Central + Karnataka schemes
- Eligibility, benefits, documents required
- Direct apply links + helpline numbers

---

## External API Keys (Optional)

| Service | Purpose | Get Key |
|---------|---------|---------|
| OpenWeather | District weather forecast | openweathermap.org/api |
| Agmarknet / data.gov.in | Real APMC price data | data.gov.in |

Without these keys, the app uses mock/demo data — fully functional for development.

---

## Demo Account

```
Phone: 9999999999
Password: farmer123
```

---

## Data Sources

- **Prices**: Agmarknet (data.gov.in) — official APMC mandi prices
- **MSP**: CACP annual announcements (Cabinet Committee on Economic Affairs)
- **Weather**: OpenWeatherMap API
- **Schemes**: PM-KISAN, PMFBY, KCC official government portals
- **Geography**: Karnataka state open data

---

## License

Built as a public-good initiative for Karnataka farmers.
Free to use and extend for agricultural development purposes.
