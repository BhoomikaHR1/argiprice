-- ============================================================
-- AgriPrice Karnataka — PostgreSQL Schema
-- Version: 1.0.0
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- for geospatial queries

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone           VARCHAR(15) UNIQUE,
    email           VARCHAR(255) UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    preferred_lang  VARCHAR(10) DEFAULT 'en' CHECK (preferred_lang IN ('en', 'kn')),
    district_id     INTEGER,
    taluk_id        INTEGER,
    is_active       BOOLEAN DEFAULT TRUE,
    is_verified     BOOLEAN DEFAULT FALSE,
    role            VARCHAR(20) DEFAULT 'farmer' CHECK (role IN ('farmer', 'trader', 'admin')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KARNATAKA GEOGRAPHY
-- ============================================================

CREATE TABLE districts (
    id          SERIAL PRIMARY KEY,
    name_en     VARCHAR(100) NOT NULL,
    name_kn     VARCHAR(100) NOT NULL,
    code        VARCHAR(10) UNIQUE NOT NULL,
    latitude    DECIMAL(10,7),
    longitude   DECIMAL(10,7)
);

CREATE TABLE taluks (
    id          SERIAL PRIMARY KEY,
    district_id INTEGER NOT NULL REFERENCES districts(id),
    name_en     VARCHAR(100) NOT NULL,
    name_kn     VARCHAR(100) NOT NULL
);

CREATE TABLE apmc_markets (
    id              SERIAL PRIMARY KEY,
    taluk_id        INTEGER REFERENCES taluks(id),
    district_id     INTEGER NOT NULL REFERENCES districts(id),
    name_en         VARCHAR(200) NOT NULL,
    name_kn         VARCHAR(200) NOT NULL,
    address         TEXT,
    latitude        DECIMAL(10,7) NOT NULL,
    longitude       DECIMAL(10,7) NOT NULL,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    market_type     VARCHAR(50) DEFAULT 'APMC',  -- APMC, eNAM, Sub-yard
    is_active       BOOLEAN DEFAULT TRUE,
    agmarknet_code  VARCHAR(50),  -- for API integration
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CROPS
-- ============================================================

CREATE TABLE crop_categories (
    id          SERIAL PRIMARY KEY,
    name_en     VARCHAR(100) NOT NULL,
    name_kn     VARCHAR(100) NOT NULL,
    icon        VARCHAR(10)  -- emoji icon
);

CREATE TABLE crops (
    id              SERIAL PRIMARY KEY,
    category_id     INTEGER REFERENCES crop_categories(id),
    name_en         VARCHAR(200) NOT NULL,
    name_kn         VARCHAR(200) NOT NULL,
    scientific_name VARCHAR(300),
    local_names     JSONB DEFAULT '{}',  -- {"hindi": "...", "telugu": "..."}
    varieties       JSONB DEFAULT '[]',  -- [{"name": "BT Cotton", "grade": "FAQ"}]
    image_url       TEXT,
    has_msp         BOOLEAN DEFAULT FALSE,
    msp_2024_25     DECIMAL(10,2),       -- ₹ per quintal
    unit            VARCHAR(20) DEFAULT 'quintal',
    season          VARCHAR(50),         -- Kharif, Rabi, Zaid, Year-round
    storage_type    VARCHAR(100),
    shelf_life_days INTEGER,
    description_en  TEXT,
    description_kn  TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0
);

-- ============================================================
-- PRICES (Live + Historical)
-- ============================================================

CREATE TABLE price_records (
    id              BIGSERIAL PRIMARY KEY,
    crop_id         INTEGER NOT NULL REFERENCES crops(id),
    apmc_id         INTEGER NOT NULL REFERENCES apmc_markets(id),
    variety         VARCHAR(200),
    grade           VARCHAR(50) DEFAULT 'FAQ',
    min_price       DECIMAL(10,2),
    max_price       DECIMAL(10,2),
    modal_price     DECIMAL(10,2) NOT NULL,   -- Most common traded price
    arrivals_tonnes DECIMAL(10,2),
    trade_date      DATE NOT NULL,
    source          VARCHAR(50) DEFAULT 'agmarknet',  -- agmarknet, enam, manual
    is_verified     BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crop_id, apmc_id, variety, trade_date)
);

-- Index for fast lookups
CREATE INDEX idx_price_crop_date ON price_records(crop_id, trade_date DESC);
CREATE INDEX idx_price_apmc_date ON price_records(apmc_id, trade_date DESC);
CREATE INDEX idx_price_date ON price_records(trade_date DESC);

-- ============================================================
-- AI PREDICTIONS
-- ============================================================

CREATE TABLE price_predictions (
    id              BIGSERIAL PRIMARY KEY,
    crop_id         INTEGER NOT NULL REFERENCES crops(id),
    apmc_id         INTEGER NOT NULL REFERENCES apmc_markets(id),
    predicted_date  DATE NOT NULL,
    predicted_price DECIMAL(10,2) NOT NULL,
    confidence      DECIMAL(5,2),       -- 0-100%
    model_version   VARCHAR(50),
    features_used   JSONB DEFAULT '{}', -- {"weather": {...}, "arrivals": ...}
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crop_id, apmc_id, predicted_date)
);

CREATE TABLE ai_recommendations (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             UUID REFERENCES users(id),
    crop_id             INTEGER NOT NULL REFERENCES crops(id),
    current_apmc_id     INTEGER REFERENCES apmc_markets(id),
    recommendation      VARCHAR(50) NOT NULL,  -- SELL_TODAY, HOLD, WAIT_2_DAYS, GOVT_PROCUREMENT, BEST_APMC
    confidence          DECIMAL(5,2),
    reasoning_en        TEXT,
    reasoning_kn        TEXT,
    best_apmc_id        INTEGER REFERENCES apmc_markets(id),
    estimated_profit    DECIMAL(10,2),
    transport_cost      DECIMAL(10,2),
    net_profit          DECIMAL(10,2),
    valid_until         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WEATHER
-- ============================================================

CREATE TABLE weather_data (
    id              BIGSERIAL PRIMARY KEY,
    district_id     INTEGER NOT NULL REFERENCES districts(id),
    recorded_at     TIMESTAMPTZ NOT NULL,
    temperature     DECIMAL(5,2),    -- °C
    humidity        DECIMAL(5,2),    -- %
    rainfall_mm     DECIMAL(8,2),
    wind_speed      DECIMAL(6,2),    -- km/h
    condition       VARCHAR(100),
    icon            VARCHAR(50),
    source          VARCHAR(50) DEFAULT 'openweather',
    UNIQUE(district_id, recorded_at)
);

-- ============================================================
-- GOVERNMENT SCHEMES & MSP
-- ============================================================

CREATE TABLE government_schemes (
    id              SERIAL PRIMARY KEY,
    name_en         VARCHAR(300) NOT NULL,
    name_kn         VARCHAR(300) NOT NULL,
    description_en  TEXT,
    description_kn  TEXT,
    ministry        VARCHAR(200),
    benefit_type    VARCHAR(100),   -- subsidy, loan, insurance, price_support
    eligibility     TEXT,
    apply_url       TEXT,
    helpline        VARCHAR(50),
    is_active       BOOLEAN DEFAULT TRUE,
    valid_from      DATE,
    valid_until     DATE
);

CREATE TABLE scheme_crops (
    scheme_id   INTEGER REFERENCES government_schemes(id),
    crop_id     INTEGER REFERENCES crops(id),
    PRIMARY KEY (scheme_id, crop_id)
);

CREATE TABLE msp_history (
    id          SERIAL PRIMARY KEY,
    crop_id     INTEGER NOT NULL REFERENCES crops(id),
    year        VARCHAR(10) NOT NULL,   -- "2024-25"
    msp_price   DECIMAL(10,2) NOT NULL,
    announced   DATE,
    UNIQUE(crop_id, year)
);

-- ============================================================
-- USER FEATURES
-- ============================================================

CREATE TABLE user_saved_crops (
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_id     INTEGER REFERENCES crops(id),
    added_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, crop_id)
);

CREATE TABLE user_notifications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    title_en    VARCHAR(300),
    title_kn    VARCHAR(300),
    body_en     TEXT,
    body_kn     TEXT,
    type        VARCHAR(50),  -- price_alert, weather, scheme, recommendation
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE joint_community_entries (
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id       INTEGER NOT NULL REFERENCES crops(id),
    quantity      DECIMAL(12,2) NOT NULL,
    unit          VARCHAR(20) NOT NULL,
    quantity_kg   INTEGER NOT NULL,
    village_name  VARCHAR(255) NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_joint_community_crop ON joint_community_entries(crop_id);
CREATE INDEX idx_joint_community_user ON joint_community_entries(user_id);

CREATE TABLE price_alerts (
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    crop_id         INTEGER REFERENCES crops(id),
    apmc_id         INTEGER REFERENCES apmc_markets(id),
    alert_type      VARCHAR(20) CHECK (alert_type IN ('above', 'below')),
    target_price    DECIMAL(10,2) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    triggered_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEED: Karnataka Districts (all 31)
-- ============================================================

INSERT INTO districts (name_en, name_kn, code) VALUES
('Bagalkot',        'ಬಾಗಲಕೋಟೆ',   'BGK'),
('Ballari',         'ಬಳ್ಳಾರಿ',      'BLR'),
('Belagavi',        'ಬೆಳಗಾವಿ',     'BGV'),
('Bengaluru Rural', 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ', 'BGR'),
('Bengaluru Urban', 'ಬೆಂಗಳೂರು ನಗರ', 'BGU'),
('Bidar',           'ಬೀದರ್',        'BDR'),
('Chamarajanagar',  'ಚಾಮರಾಜನಗರ',   'CJN'),
('Chikkaballapura', 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ', 'CBP'),
('Chikkamagaluru',  'ಚಿಕ್ಕಮಗಳೂರು', 'CMG'),
('Chitradurga',     'ಚಿತ್ರದುರ್ಗ',   'CTD'),
('Dakshina Kannada','ದಕ್ಷಿಣ ಕನ್ನಡ', 'DKD'),
('Davanagere',      'ದಾವಣಗೆರೆ',    'DVG'),
('Dharwad',         'ಧಾರವಾಡ',      'DWD'),
('Gadag',           'ಗದಗ',          'GDG'),
('Hassan',          'ಹಾಸನ',         'HSN'),
('Haveri',          'ಹಾವೇರಿ',       'HVR'),
('Kalaburagi',      'ಕಲಬುರಗಿ',     'KLB'),
('Kodagu',          'ಕೊಡಗು',        'KDG'),
('Kolar',           'ಕೋಲಾರ',        'KLR'),
('Koppal',          'ಕೊಪ್ಪಳ',       'KPL'),
('Mandya',          'ಮಂಡ್ಯ',        'MDY'),
('Mysuru',          'ಮೈಸೂರು',      'MYS'),
('Raichur',         'ರಾಯಚೂರು',    'RCR'),
('Ramanagara',      'ರಾಮನಗರ',      'RMN'),
('Shivamogga',      'ಶಿವಮೊಗ್ಗ',    'SMG'),
('Tumakuru',        'ತುಮಕೂರು',     'TMK'),
('Udupi',           'ಉಡುಪಿ',        'UDP'),
('Uttara Kannada',  'ಉತ್ತರ ಕನ್ನಡ', 'UKD'),
('Vijayapura',      'ವಿಜಯಪುರ',     'VJP'),
('Yadgir',          'ಯಾದಗಿರಿ',      'YDG'),
('Vijayanagara',    'ವಿಜಯನಗರ',     'VNG');

-- ============================================================
-- SEED: Crop Categories
-- ============================================================

INSERT INTO crop_categories (name_en, name_kn, icon) VALUES
('Cereals & Millets',   'ಧಾನ್ಯಗಳು',          '🌾'),
('Pulses',              'ದ್ವಿದಳ ಧಾನ್ಯಗಳು',    '🫘'),
('Oilseeds',            'ಎಣ್ಣೆಕಾಳು',           '🌻'),
('Vegetables',          'ತರಕಾರಿ',              '🥬'),
('Fruits',              'ಹಣ್ಣುಗಳು',             '🍌'),
('Spices & Condiments', 'ಮಸಾಲೆ ಪದಾರ್ಥಗಳು',   '🌶️'),
('Plantation Crops',    'ತೋಟದ ಬೆಳೆಗಳು',       '☕'),
('Fibres',              'ನಾರು ಬೆಳೆಗಳು',        '🧵');

-- ============================================================
-- SEED: 60+ Karnataka Crops
-- ============================================================

INSERT INTO crops (category_id, name_en, name_kn, scientific_name, has_msp, msp_2024_25, season, storage_type, shelf_life_days) VALUES
-- Cereals & Millets (cat 1) — MSP crops
(1, 'Rice (Paddy)',    'ಭತ್ತ',       'Oryza sativa',            TRUE,  2300.00, 'Kharif',      'Dry warehouse',    365),
(1, 'Ragi',           'ರಾಗಿ',       'Eleusine coracana',        TRUE,  3846.00, 'Kharif/Rabi', 'Dry warehouse',    365),
(1, 'Maize',          'ಮೆಕ್ಕೆಜೋಳ', 'Zea mays',                 TRUE,  2090.00, 'Kharif/Rabi', 'Dry silo',         180),
(1, 'Jowar (Sorghum)','ಜೋಳ',        'Sorghum bicolor',          TRUE,  3371.00, 'Kharif/Rabi', 'Dry warehouse',    365),
(1, 'Bajra',          'ಸಜ್ಜೆ',      'Pennisetum glaucum',       TRUE,  2625.00, 'Kharif',      'Dry warehouse',    365),
(1, 'Wheat',          'ಗೋಧಿ',       'Triticum aestivum',        TRUE,  2275.00, 'Rabi',        'Dry warehouse',    365),

-- Pulses (cat 2) — MSP crops
(2, 'Tur (Arhar)',    'ತೊಗರಿ',      'Cajanus cajan',            TRUE,  7550.00, 'Kharif',      'Dry warehouse',    365),
(2, 'Moong (Green Gram)','ಹೆಸರು',  'Vigna radiata',            TRUE,  8682.00, 'Kharif/Rabi', 'Dry warehouse',    365),
(2, 'Urad (Black Gram)','ಉದ್ದು',   'Vigna mungo',              TRUE,  7400.00, 'Kharif/Rabi', 'Dry warehouse',    365),
(2, 'Chana (Chickpea)','ಕಡಲೆ',     'Cicer arietinum',          TRUE,  5440.00, 'Rabi',        'Dry warehouse',    365),
(2, 'Masur (Lentil)', 'ಮಸೂರ',      'Lens culinaris',           TRUE,  6425.00, 'Rabi',        'Dry warehouse',    365),
(2, 'Horse Gram',     'ಹುರುಳಿ',    'Macrotyloma uniflorum',    FALSE, NULL,    'Kharif',      'Dry warehouse',    365),

-- Oilseeds (cat 3)
(3, 'Groundnut',      'ಕಡಲೆಕಾಯಿ',  'Arachis hypogaea',         TRUE,  6783.00, 'Kharif',      'Cool dry store',   180),
(3, 'Sunflower',      'ಸೂರ್ಯಕಾಂತಿ','Helianthus annuus',         TRUE,  7280.00, 'Rabi/Kharif', 'Dry warehouse',    180),
(3, 'Soybean',        'ಸೋಯಾಬೀನ್',  'Glycine max',              TRUE,  4892.00, 'Kharif',      'Dry warehouse',    180),
(3, 'Safflower',      'ಕುಸುಂಬಿ',   'Carthamus tinctorius',     TRUE,  5800.00, 'Rabi',        'Dry warehouse',    180),
(3, 'Sesamum (Til)',  'ಎಳ್ಳು',     'Sesamum indicum',          TRUE,  9267.00, 'Kharif',      'Cool dry store',   180),
(3, 'Castor',         'ಹರಳು',      'Ricinus communis',         FALSE, NULL,    'Kharif/Rabi', 'Dry warehouse',    365),
(3, 'Coconut',        'ತೆಂಗಿನಕಾಯಿ','Cocos nucifera',            FALSE, NULL,    'Year-round',  'Dry ventilated',    30),

-- Vegetables (cat 4) — No MSP
(4, 'Tomato',         'ಟೊಮೇಟೊ',   'Solanum lycopersicum',      FALSE, NULL,    'Year-round',  'Cold storage',       7),
(4, 'Onion',          'ಈರುಳ್ಳಿ',  'Allium cepa',               FALSE, NULL,    'Rabi/Kharif', 'Cool dry store',    60),
(4, 'Potato',         'ಆಲೂಗಡ್ಡೆ', 'Solanum tuberosum',         FALSE, NULL,    'Rabi',        'Cold storage',      90),
(4, 'Brinjal',        'ಬದನೆ',      'Solanum melongena',         FALSE, NULL,    'Year-round',  'Ambient',            5),
(4, 'Cabbage',        'ಎಲೆಕೋಸು',  'Brassica oleracea',         FALSE, NULL,    'Rabi',        'Cold storage',      14),
(4, 'Cauliflower',    'ಹೂಕೋಸು',   'Brassica oleracea botrytis',FALSE, NULL,    'Rabi',        'Cold storage',       7),
(4, 'Beans (French)', 'ಅವರೆಕಾಯಿ', 'Phaseolus vulgaris',        FALSE, NULL,    'Rabi',        'Cold storage',       5),
(4, 'Capsicum',       'ದೊಡ್ಡ ಮೆಣಸು','Capsicum annuum',          FALSE, NULL,    'Year-round',  'Cold storage',      10),
(4, 'Bitter Gourd',   'ಹಾಗಲಕಾಯಿ', 'Momordica charantia',       FALSE, NULL,    'Year-round',  'Ambient',            5),
(4, 'Ridge Gourd',    'ಹೀರೇಕಾಯಿ', 'Luffa acutangula',         FALSE, NULL,    'Year-round',  'Ambient',            3),
(4, 'Ash Gourd',      'ಬೂದುಗುಂಬಳ','Benincasa hispida',         FALSE, NULL,    'Year-round',  'Dry cool store',   90),
(4, 'Pumpkin',        'ಕುಂಬಳಕಾಯಿ', 'Cucurbita maxima',         FALSE, NULL,    'Year-round',  'Dry cool store',   60),
(4, 'Ladies Finger',  'ಬೆಂಡೆಕಾಯಿ', 'Abelmoschus esculentus',  FALSE, NULL,    'Year-round',  'Ambient',            3),
(4, 'Carrot',         'ಗಾಜರ',      'Daucus carota',            FALSE, NULL,    'Rabi',        'Cold storage',      30),
(4, 'Radish',         'ಮೂಲಂಗಿ',    'Raphanus sativus',         FALSE, NULL,    'Rabi',        'Cold storage',      14),
(4, 'Green Chilli',   'ಹಸಿ ಮೆಣಸಿನಕಾಯಿ','Capsicum annuum',     FALSE, NULL,    'Year-round',  'Cold storage',       7),
(4, 'Coriander (Green)','ಕೊತ್ತಂಬರಿ ಸೊಪ್ಪು','Coriandrum sativum',FALSE,NULL,  'Year-round',  'Cold storage',       5),
(4, 'Spinach',        'ಪಾಲಕ ಸೊಪ್ಪು','Spinacia oleracea',       FALSE, NULL,    'Year-round',  'Cold storage',       3),
(4, 'Drumstick',      'ನುಗ್ಗೇಕಾಯಿ', 'Moringa oleifera',        FALSE, NULL,    'Year-round',  'Ambient',            5),
(4, 'Garlic',         'ಬೆಳ್ಳುಳ್ಳಿ', 'Allium sativum',          FALSE, NULL,    'Rabi',        'Cool dry store',    90),
(4, 'Ginger',         'ಶುಂಠಿ',     'Zingiber officinale',       FALSE, NULL,    'Kharif',      'Cool dry store',    30),

-- Fruits (cat 5) — No MSP
(5, 'Mango',          'ಮಾವು',      'Mangifera indica',          FALSE, NULL,    'Summer',      'Cool ventilated',   14),
(5, 'Banana',         'ಬಾಳೆ',      'Musa spp.',                 FALSE, NULL,    'Year-round',  'Ambient',            7),
(5, 'Grapes',         'ದ್ರಾಕ್ಷಿ',  'Vitis vinifera',            FALSE, NULL,    'Summer',      'Cold storage',      14),
(5, 'Pomegranate',    'ದಾಳಿಂಬೆ',  'Punica granatum',           FALSE, NULL,    'Year-round',  'Cool ventilated',   30),
(5, 'Papaya',         'ಪಪ್ಪಾಯಿ',  'Carica papaya',             FALSE, NULL,    'Year-round',  'Ambient',            7),
(5, 'Guava',          'ಸೀಬೆ',      'Psidium guajava',           FALSE, NULL,    'Year-round',  'Ambient',            5),
(5, 'Sapota',         'ಸಪೋಟ',      'Manilkara zapota',          FALSE, NULL,    'Year-round',  'Ambient',            5),
(5, 'Watermelon',     'ಕಲ್ಲಂಗಡಿ',  'Citrullus lanatus',        FALSE, NULL,    'Summer',      'Ambient',           14),
(5, 'Sweet Lime',     'ಮೋಸಂಬಿ',   'Citrus limetta',            FALSE, NULL,    'Year-round',  'Cool ventilated',   21),

-- Spices (cat 6) — No MSP
(6, 'Dry Red Chilli', 'ಒಣ ಮೆಣಸಿನಕಾಯಿ','Capsicum annuum',        FALSE, NULL,    'Rabi',        'Dry cool store',   180),
(6, 'Coriander Seed', 'ಕೊತ್ತಂಬರಿ ಬೀಜ','Coriandrum sativum',    FALSE, NULL,    'Rabi',        'Dry warehouse',    365),
(6, 'Turmeric',       'ಅರಿಷಿಣ',    'Curcuma longa',            FALSE, NULL,    'Kharif',      'Dry cool store',   365),
(6, 'Cumin (Jeera)',  'ಜೀರಿಗೆ',   'Cuminum cyminum',           FALSE, NULL,    'Rabi',        'Dry warehouse',    365),
(6, 'Fenugreek',      'ಮೆಂತ್ಯ',    'Trigonella foenum-graecum',FALSE, NULL,    'Rabi',        'Dry warehouse',    365),
(6, 'Black Pepper',   'ಕಾಳು ಮೆಣಸು','Piper nigrum',              FALSE, NULL,    'Year-round',  'Dry cool store',   365),
(6, 'Cardamom',       'ಏಲಕ್ಕಿ',    'Elettaria cardamomum',     FALSE, NULL,    'Year-round',  'Airtight cool',    365),
(6, 'Arecanut (Betel)','ಅಡಿಕೆ',   'Areca catechu',             FALSE, NULL,    'Year-round',  'Dry ventilated',   365),

-- Plantation Crops (cat 7)
(7, 'Coffee (Robusta)','ರೋಬಸ್ಟಾ ಕಾಫಿ','Coffea canephora',       FALSE, NULL,    'Year-round',  'Dry warehouse',    365),
(7, 'Coffee (Arabica)','ಅರೇಬಿಕಾ ಕಾಫಿ','Coffea arabica',         FALSE, NULL,    'Year-round',  'Dry warehouse',    365),
(7, 'Tea',            'ಚಹಾ',        'Camellia sinensis',         FALSE, NULL,    'Year-round',  'Airtight cool',    365),
(7, 'Rubber',         'ರಬ್ಬರ್',    'Hevea brasiliensis',        FALSE, NULL,    'Year-round',  'Dry warehouse',    365),

-- Fibres (cat 8) — Cotton has MSP
(8, 'Cotton',         'ಹತ್ತಿ',     'Gossypium hirsutum',        TRUE,  7521.00, 'Kharif',      'Dry warehouse',    365),
(8, 'Jute',           'ಸೆಣಬು',     'Corchorus spp.',            TRUE,  5335.00, 'Kharif',      'Dry warehouse',    365),
(8, 'Sugarcane',      'ಕಬ್ಬು',     'Saccharum officinarum',     FALSE, NULL,    'Year-round',  'Process quickly',    3);
