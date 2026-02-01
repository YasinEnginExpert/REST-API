-- Enable UUID extension for better ID management (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Locations Table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostname VARCHAR(255) NOT NULL UNIQUE,
    ip VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    vendor VARCHAR(100), -- Cisco, Nokia, Arista
    os VARCHAR(100),     -- IOS-XE, SR Linux, EOS
    serial_number VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'active', -- active, maintenance, offline
    rack_position VARCHAR(50),
    location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VLANs Table
CREATE TABLE IF NOT EXISTS vlans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vlan_id INT NOT NULL CHECK (vlan_id BETWEEN 1 AND 4094),
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Interfaces Table
CREATE TABLE IF NOT EXISTS interfaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50), -- CIDR notation preferred (e.g. 192.168.1.1/24)
    mac_address VARCHAR(20),
    speed VARCHAR(20),      -- e.g. 10Gbps
    type VARCHAR(50),       -- e.g. ethernet, loopback, vlan
    description TEXT,
    status VARCHAR(20) DEFAULT 'up',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Data (Idempotent)

-- 1. Locations
INSERT INTO locations (name, city, country, address)
SELECT 'Istanbul DC', 'Istanbul', 'Turkey', 'Levent Mah. No:1'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Istanbul DC');

INSERT INTO locations (name, city, country, address)
SELECT 'Ankara Core', 'Ankara', 'Turkey', 'Kizilay Meydani No:5'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Ankara Core');

INSERT INTO locations (name, city, country, address)
SELECT 'Izmir Edge', 'Izmir', 'Turkey', 'Alsancak Kordon'
WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name = 'Izmir Edge');

-- 2. VLANs
INSERT INTO vlans (vlan_id, name, description) VALUES 
(1, 'default', 'Default VLAN'),
(10, 'Management', 'Network Management'),
(20, 'Server_Farm', 'Prod Servers'),
(30, 'Guest_Wifi', 'Guest Access'),
(100, 'Voice', 'VoIP Phones')
ON CONFLICT DO NOTHING; -- Assuming no unique constraint on vlan_id in schema, but good practice. 
-- Actually schema has no unique on vlan_id, so let's use EXISTS check if needed, but for simplicity:
-- PostgreSQL < 9.5 doesn't support ON CONFLICT, but we are using 15.
-- However, our table definition doesn't have unique constraint on vlan_id, only ID. 
-- Let's stick to WHERE NOT EXISTS for safety.

INSERT INTO vlans (vlan_id, name, description)
SELECT 99, 'Native', 'Native VLAN'
WHERE NOT EXISTS (SELECT 1 FROM vlans WHERE vlan_id = 99);


-- 3. Devices
-- Istanbul Devices
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, location_id, serial_number)
SELECT 'ist-core-01', '10.1.1.1', 'Nokia 7750 SR-12', 'Nokia', 'SR OS', 'active', 'Rack A1-U10', id, 'NOK12345678'
FROM locations WHERE name = 'Istanbul DC'
AND NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-core-01');

INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, location_id, serial_number)
SELECT 'ist-agg-01', '10.1.2.1', 'Cisco Nexus 9000', 'Cisco', 'NX-OS', 'active', 'Rack B2-U20', id, 'CSCO998877'
FROM locations WHERE name = 'Istanbul DC'
AND NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-agg-01');

-- Ankara Devices
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, location_id, serial_number)
SELECT 'ank-rtr-01', '10.2.1.1', 'Juniper MX480', 'Juniper', 'Junos', 'active', 'Rack C1-U15', id, 'JNP112233'
FROM locations WHERE name = 'Ankara Core'
AND NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ank-rtr-01');

-- Izmir Devices
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, location_id, serial_number)
SELECT 'izm-sw-01', '10.3.1.1', 'Arista 7280R', 'Arista', 'EOS', 'maintenance', 'Rack D4-U40', id, 'ARI556677'
FROM locations WHERE name = 'Izmir Edge'
AND NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'izm-sw-01');


-- 4. Interfaces
-- Linking interfaces to their devices dynamically

-- ist-core-01 Interfaces
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status)
SELECT id, '1/1/1', '10.1.1.1/30', '00:01:02:03:04:01', '100Gbps', 'fiber', 'up'
FROM devices WHERE hostname = 'ist-core-01'
AND NOT EXISTS (SELECT 1 FROM interfaces WHERE name = '1/1/1' AND device_id = devices.id);

INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status)
SELECT id, '1/1/2', '10.1.1.5/30', '00:01:02:03:04:02', '100Gbps', 'fiber', 'down'
FROM devices WHERE hostname = 'ist-core-01'
AND NOT EXISTS (SELECT 1 FROM interfaces WHERE name = '1/1/2' AND device_id = devices.id);

-- ist-agg-01 Interfaces
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status)
SELECT id, 'Eth1/1', '192.168.10.1/24', 'AA:BB:CC:DD:EE:01', '40Gbps', 'copper', 'up'
FROM devices WHERE hostname = 'ist-agg-01'
AND NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Eth1/1' AND device_id = devices.id);

-- ank-rtr-01 Interfaces
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status)
SELECT id, 'ge-0/0/0', '172.16.0.1/24', '11:22:33:44:55:66', '10Gbps', 'fiber', 'up'
FROM devices WHERE hostname = 'ank-rtr-01'
AND NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'ge-0/0/0' AND device_id = devices.id);
