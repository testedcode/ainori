package db

// Database schema migrations

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    carbon_credits INTEGER DEFAULT 0,
    upi_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createCitiesTable = `
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('active', 'locked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createCorridorsTable = `
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
`

const createUserCorridorsTable = `
CREATE TABLE IF NOT EXISTS user_corridors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    corridor_id INTEGER REFERENCES corridors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, corridor_id)
);
`

const createVehiclesTable = `
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
`

const createRidesTable = `
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
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'partially_filled', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createRideRequestsTable = `
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
`

const createMessagesTable = `
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER REFERENCES rides(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createPaymentsTable = `
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
`

const createCarbonCreditsTable = `
CREATE TABLE IF NOT EXISTS carbon_credits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ride_id INTEGER REFERENCES rides(id) ON DELETE SET NULL,
    credits INTEGER NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const createFeatureFlagsTable = `
CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

const insertInitialData = `
-- Insert cities
INSERT INTO cities (name, status) VALUES 
    ('Mumbai', 'active'),
    ('Pune', 'locked'),
    ('Bangalore', 'locked')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin user (password: admin)
-- Password hash for 'admin' using bcrypt (cost 10)
-- Generated with: echo -n "admin" | htpasswd -nBCi 10 "" | cut -d: -f2
INSERT INTO users (email, password_hash, name, role, city) VALUES 
    ('admin@135', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', 'admin', 'Mumbai')
ON CONFLICT (email) DO NOTHING;

-- Insert sample corridors for Mumbai
INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active) 
SELECT 
    c.id,
    'Powai → BKC',
    'Powai',
    'BKC',
    'Hiranandani, IIT Bombay, Powai Lake',
    'Standard carpooling terms apply',
    true
FROM cities c WHERE c.name = 'Mumbai'
ON CONFLICT DO NOTHING;

INSERT INTO corridors (city_id, name, location_from, location_to, pickup_points, terms_conditions, is_active) 
SELECT 
    c.id,
    'Andheri → Bandra',
    'Andheri',
    'Bandra',
    'Andheri Station, Lokhandwala, Versova',
    'Standard carpooling terms apply',
    true
FROM cities c WHERE c.name = 'Mumbai'
ON CONFLICT DO NOTHING;

-- Insert feature flags
INSERT INTO feature_flags (name, enabled, description) VALUES 
    ('maps_enabled', false, 'Enable map features'),
    ('live_tracking', false, 'Enable live distance tracking'),
    ('ai_features', true, 'Enable AI-powered features')
ON CONFLICT (name) DO NOTHING;
`

