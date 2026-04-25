-- =============================================================================
-- cpool.ai – Run this ONCE in Supabase: SQL Editor → New query → Paste → Run
-- Admin login after run: Email admin@135  Password password
-- =============================================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_premium BOOLEAN DEFAULT false,
    profile_pic TEXT,
    good_vibes INTEGER DEFAULT 0,
    carbon_credits INTEGER DEFAULT 0,
    upi_id VARCHAR(255),
    is_beta BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false;

-- Cities
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('active', 'locked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Corridors
CREATE TABLE IF NOT EXISTS corridors (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_from VARCHAR(255) NOT NULL,
    location_to VARCHAR(255) NOT NULL,
    pickup_points TEXT,
    terms_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    map_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE corridors ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE corridors ADD COLUMN IF NOT EXISTS image_url TEXT;

-- User Corridors
CREATE TABLE IF NOT EXISTS user_corridors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    corridor_id INTEGER REFERENCES corridors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, corridor_id)
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('car', 'bike')),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    total_seats INTEGER NOT NULL,
    default_available_seats INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Rides
CREATE TABLE IF NOT EXISTS rides (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    corridor_id INTEGER REFERENCES corridors(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    ride_date DATE NOT NULL,
    ride_time VARCHAR(20) NOT NULL,
    pickup_point VARCHAR(255) NOT NULL,
    drop_point VARCHAR(255) NOT NULL,
    route_description TEXT,
    price_per_seat DECIMAL(10, 2) NOT NULL,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'full', 'completed', 'cancelled', 'starting', 'at_pickup', 'at_dropoff')),
    started_at TIMESTAMP,
    arrived_at_loc1 TIMESTAMP,
    arrived_at_loc2 TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ride Requests
CREATE TABLE IF NOT EXISTS ride_requests (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seats_requested INTEGER NOT NULL,
    comment TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    rider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ride_giver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    rider_status VARCHAR(20) DEFAULT 'pending' CHECK (rider_status IN ('pending', 'done')),
    giver_status VARCHAR(20) DEFAULT 'pending' CHECK (giver_status IN ('pending', 'received')),
    admin_override BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, rider_id)
);

-- Carbon Credits
CREATE TABLE IF NOT EXISTS carbon_credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ride_id INTEGER REFERENCES rides(id) ON DELETE SET NULL,
    credits INTEGER NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    rater_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ratee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, rater_id, ratee_id)
);

-- SEED DATA
INSERT INTO cities (name, status) VALUES 
    ('Mumbai', 'active'),
    ('Pune', 'locked'),
    ('Bangalore', 'locked')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, password_hash, name, role, city) VALUES 
    ('admin@135', '$2a$10$3moAuCK0NMbiytuy8xQoEfu6X1O07G/a70L1WQw.GiQFWSlUbYi', 'Admin User', 'admin', 'Mumbai')
ON CONFLICT (email) DO NOTHING;

-- JOOL Phase 2 Corridors
INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active)
SELECT c.id, 'Casa Rio ↔ RCP', 'Casa Rio', 'RCP', 'Casa Rio Gate 1, Lodha Heaven, Nilje', 'Standard JOOL terms apply', true
FROM cities c WHERE c.name = 'Mumbai'
AND NOT EXISTS (SELECT 1 FROM corridors cor WHERE cor.city_id = c.id AND cor.name = 'Casa Rio ↔ RCP');

INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active)
SELECT c.id, 'Casa Bella ↔ RCP', 'Casa Bella', 'RCP', 'Casa Bella Gold, Casa Bella Diamond', 'Standard JOOL terms apply', true
FROM cities c WHERE c.name = 'Mumbai'
AND NOT EXISTS (SELECT 1 FROM corridors cor WHERE cor.city_id = c.id AND cor.name = 'Casa Bella ↔ RCP');

INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active)
SELECT c.id, 'Lakeshore ↔ RCP', 'Lakeshore', 'RCP', 'Lakeshore Greens, Palava Gate 2', 'Standard JOOL terms apply', true
FROM cities c WHERE c.name = 'Mumbai'
AND NOT EXISTS (SELECT 1 FROM corridors cor WHERE cor.city_id = c.id AND cor.name = 'Lakeshore ↔ RCP');

INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active)
SELECT c.id, 'Kharghar ↔ RCP', 'Kharghar', 'RCP', 'Hiranandani, Jalvayu Vihar', 'Standard JOOL terms apply', true
FROM cities c WHERE c.name = 'Mumbai'
AND NOT EXISTS (SELECT 1 FROM corridors cor WHERE cor.city_id = c.id AND cor.name = 'Kharghar ↔ RCP');

INSERT INTO feature_flags (name, enabled, description) VALUES 
    ('maps_enabled', false, 'Enable map features'),
    ('live_tracking', false, 'Enable live distance tracking'),
    ('ai_features', true, 'Enable AI-powered features')
ON CONFLICT (name) DO NOTHING;
