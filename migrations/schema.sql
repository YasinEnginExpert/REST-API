-- Consolidated Schema (schema.sql)
-- Combines init.sql and 002_enterprise_schema.sql into a single definition.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    address TEXT,
    site_code VARCHAR(50),
    timezone VARCHAR(80),
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Ensure site_code exists for older schemas
ALTER TABLE locations ADD COLUMN IF NOT EXISTS site_code VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_site_code ON locations(site_code) WHERE site_code IS NOT NULL;

-- 2. Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    hostname VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    vendor VARCHAR(100), -- Cisco, Nokia, Arista
    os VARCHAR(100),     -- IOS-XE, SR Linux, EOS
    os_version VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, offline
    role VARCHAR(50),
    rack_position VARCHAR(50),
    location_id VARCHAR(100) REFERENCES locations(id) ON DELETE SET NULL,
    tags JSONB,
    notes TEXT,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_devices_location_id ON devices(location_id);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_vendor ON devices(vendor);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);

-- 3. VLANs Table
CREATE TABLE IF NOT EXISTS vlans (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    vlan_id INT NOT NULL CHECK (vlan_id BETWEEN 1 AND 4094),
    name VARCHAR(100),
    description TEXT,
    location_id VARCHAR(100) REFERENCES locations(id) ON DELETE SET NULL,
    subnet_cidr VARCHAR(50),
    gateway_ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_vlans_location_vlan ON vlans(location_id, vlan_id) WHERE location_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vlans_location_id ON vlans(location_id);

-- 4. Interfaces Table
CREATE TABLE IF NOT EXISTS interfaces (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id VARCHAR(100) REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50), 
    mac_address VARCHAR(20),
    speed VARCHAR(20),
    speed_mbps INT,
    type VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'up',
    admin_status VARCHAR(20),
    oper_status VARCHAR(20),
    ifindex INT,
    mtu INT,
    mode VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_interfaces_device_name ON interfaces(device_id, name);

-- 5. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    user_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    password_reset_code VARCHAR(100),
    inactive_status BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'user',
    last_login TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE
);

-- 6. Interface VLANs (Pivot)
CREATE TABLE IF NOT EXISTS interface_vlans (
    interface_id VARCHAR(100) NOT NULL REFERENCES interfaces(id) ON DELETE CASCADE,
    vlan_id VARCHAR(100) NOT NULL REFERENCES vlans(id) ON DELETE CASCADE,
    tagging VARCHAR(20) NOT NULL DEFAULT 'tagged',
    is_native BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (interface_id, vlan_id)
);
CREATE INDEX IF NOT EXISTS idx_interface_vlans_interface ON interface_vlans(interface_id);
CREATE INDEX IF NOT EXISTS idx_interface_vlans_vlan ON interface_vlans(vlan_id);

-- 7. User Location Access (RBAC)
CREATE TABLE IF NOT EXISTS user_location_access (
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    location_id VARCHAR(100) NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    permission VARCHAR(20) NOT NULL DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, location_id)
);
CREATE INDEX IF NOT EXISTS idx_user_location_access_user ON user_location_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_access_location ON user_location_access(location_id);

-- 8. Events / Alerts
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    severity VARCHAR(20) NOT NULL,
    type VARCHAR(80) NOT NULL,
    message TEXT NOT NULL,
    device_id VARCHAR(100) REFERENCES devices(id) ON DELETE SET NULL,
    interface_id VARCHAR(100) REFERENCES interfaces(id) ON DELETE SET NULL,
    location_id VARCHAR(100) REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_location_id ON events(location_id);

-- 9. Device Metrics (Timeseries)
CREATE TABLE IF NOT EXISTS device_metrics (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    device_id VARCHAR(100) NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    cpu FLOAT,
    memory FLOAT,
    temp FLOAT,
    uptime_seconds BIGINT,
    ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_device_metrics_device_ts ON device_metrics(device_id, ts DESC);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- 11. Links (Topology)
CREATE TABLE IF NOT EXISTS links (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    a_interface_id VARCHAR(100) NOT NULL REFERENCES interfaces(id) ON DELETE CASCADE,
    b_interface_id VARCHAR(100) NOT NULL REFERENCES interfaces(id) ON DELETE CASCADE,
    discovery VARCHAR(20) NOT NULL DEFAULT 'manual',
    last_seen TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'up',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_links_ordering CHECK (a_interface_id < b_interface_id),
    CONSTRAINT uq_links_pair UNIQUE (a_interface_id, b_interface_id)
);
CREATE INDEX IF NOT EXISTS idx_links_a ON links(a_interface_id);
CREATE INDEX IF NOT EXISTS idx_links_b ON links(b_interface_id);
