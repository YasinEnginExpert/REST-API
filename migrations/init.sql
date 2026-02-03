-- Enable UUID extension for better ID management (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    hostname VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    vendor VARCHAR(100), -- Cisco, Nokia, Arista
    os VARCHAR(100),     -- IOS-XE, SR Linux, EOS
    serial_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, offline
    rack_position VARCHAR(50),
    location_id VARCHAR(100) REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VLANs Table
CREATE TABLE IF NOT EXISTS vlans (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    vlan_id INT NOT NULL CHECK (vlan_id BETWEEN 1 AND 4094),
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Interfaces Table
CREATE TABLE IF NOT EXISTS interfaces (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id VARCHAR(100) REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50), -- CIDR notation preferred (e.g. 192.168.1.1/24)
    mac_address VARCHAR(20),
    speed VARCHAR(20),      -- e.g. 10Gbps
    type VARCHAR(50),       -- e.g. ethernet, loopback, vlan
    description TEXT,
    status VARCHAR(20) DEFAULT 'up',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
