-- ==================================================================================
-- MANUAL SEED DATA SCRIPT
-- ==================================================================================
-- NOTE: This script adheres to the init.sql schema which uses UUIDs.
-- IDs are fully auto-generated. Foreign keys are resolved via sub-queries.
-- ==================================================================================

-- ==================================================================================
-- 1. IDENTITY & ACCESS (Users)
-- ==================================================================================

INSERT INTO users (first_name, last_name, email, username, password, role, inactive_status) VALUES
('Admin',  'User', 'admin@example.com',  'admin',  '$argon2id$v=19$m=65536,t=1,p=4$X3Y4GbVV8pnrXFl/RHL3xw$7DDEkAYfAqeB14mhBFYajtMxGt24h+tIj8fJrmxXeXw', 'admin',  FALSE),
('Editor', 'User', 'editor@example.com', 'editor', '$argon2id$v=19$m=65536,t=1,p=4$X3Y4GbVV8pnrXFl/RHL3xw$7DDEkAYfAqeB14mhBFYajtMxGt24h+tIj8fJrmxXeXw', 'editor', FALSE),
('Viewer', 'User', 'viewer@example.com', 'viewer', '$argon2id$v=19$m=65536,t=1,p=4$X3Y4GbVV8pnrXFl/RHL3xw$7DDEkAYfAqeB14mhBFYajtMxGt24h+tIj8fJrmxXeXw', 'viewer', FALSE);


-- ==================================================================================
-- 2. LOCATIONS (Auto-Generated UUIDs)
-- ==================================================================================

INSERT INTO locations (name, city, country, address) VALUES 
-- Global Major Sites
('Global Tech HQ',     'San Francisco', 'USA',       'Salesforce Tower'),
('Berlin Gigafactory', 'Berlin',        'Germany',   'Am Tesla Grohmann'),
('Boston Med Center',  'Boston',        'USA',       'Longwood Med Area'),
('Shanghai Port Hub',  'Shanghai',      'China',     'Yangshan Port'),
('Oxford St Flagship', 'London',        'UK',        'Oxford Street'),
('Smart City Control', 'Dubai',         'UAE',       'Museum of the Future'),
('Nordic Energy Hub',  'Oslo',          'Norway',    'Fjord City'),
('Tech University',    'Singapore',     'Singapore', 'Clementi Road'),
('Deep Space Comms',   'Austin',        'USA',       'SpaceX Boca Chica'),
('5G Edge Core',       'Manchester',    'UK',        'MediaCityUK'),
-- Specialized Sites
('AI Research Cluster',  'Montreal',    'Canada',    'Mila Institute'),
('Subsea Cable Station', 'Lisbon',      'Portugal',  'Carcavelos Beach'),
('HFT Trading Floor',    'Chicago',     'USA',       'CME Group Data Center'),
-- Turkey Region
('Istanbul HQ - Maslak',          'Istanbul',  'Turkey', 'Maslak 1453 Plaza, Floor 25'),
('Istanbul DC - Esenyurt',        'Istanbul',  'Turkey', 'Esenyurt Data Center Campus, Hall 2'),
('Istanbul Branch - Kadikoy',     'Istanbul',  'Turkey', 'Bagdat Caddesi No:45'),
('Istanbul Backup Site',          'Istanbul',  'Turkey', 'Umraniye Technopark'),
('Ankara Main Office - Sogutozu', 'Ankara',    'Turkey', 'Armada Tower B, Floor 10'),
('Ankara DR Site - Golbasi',      'Ankara',    'Turkey', 'Turk Telekom Campus'),
('Ankara R&D - ODTU',             'Ankara',    'Turkey', 'ODTU Teknokent Gallium Block'),
('Izmir Regional Office',         'Izmir',     'Turkey', 'Folkart Towers A Block'),
('Izmir Warehouse - Aliaga',      'Izmir',     'Turkey', 'Aliaga Industrial Zone, Plot 55'),
('Bursa Factory',                 'Bursa',     'Turkey', 'NOSAB Industrial Park'),
('Antalya Resort Hub',            'Antalya',   'Turkey', 'Lara Tourism Road'),
('Adana Logistics Center',        'Adana',     'Turkey', 'Incirlik Cargo Hub'),
('Trabzon Coastal Hub',           'Trabzon',   'Turkey', 'Black Sea Port Auth'),
('Gaziantep Trade Office',        'Gaziantep', 'Turkey', 'Organize Sanayi Bolgesi'),
('Kayseri Server Farm',           'Kayseri',   'Turkey', 'Erciyes Tech Valley'),
('Eskisehir Uni Campus',          'Eskisehir', 'Turkey', 'Anadolu Univ. Network Center'),
('Mersin Port Auth',              'Mersin',    'Turkey', 'Port Operations Bldg'),
('Konya Data Hub',                'Konya',     'Turkey', 'Selcuklu IT Center'),
('Diyarbakir Edge',               'Diyarbakir', 'Turkey', 'Kayapinar Office'),
('Samsun Fiber Node',             'Samsun',    'Turkey', 'Atakum POP Point');


-- ==================================================================================
-- 3. VLANs
-- ==================================================================================
INSERT INTO vlans (vlan_id, name, description) VALUES
(1,    'Default',             'Factory Default VLAN'),
(10,   'Mgmt_Network',        'OOB Management Network'),
(20,   'Server_Farm',         'Production Servers segment'),
(30,   'User_Data_Istanbul',  'Istanbul Office Users'),
(31,   'User_Data_Ankara',    'Ankara Office Users'),
(32,   'User_Data_Izmir',     'Izmir Office Users'),
(40,   'Voice_VoIP',          'IP Phones and PBX'),
(50,   'Guest_Wifi',          'Isolated Guest Access'),
(60,   'IoT_Sensors',         'Factory IoT Devices'),
(70,   'CCTV_Security',       'Security Cameras'),
(80,   'Storage_SAN',         'iSCSI Storage Traffic'),
(90,   'DMZ_Public',          'Public Facing Services'),
(100,  'Dev_Environment',     'Development and Testing'),
(101,  'IoT-Sensors-Global',  'Zigbee/LoRa Gateways'),
(201,  'OT-PLC',              'Programmable Logic Controllers'),
(301,  'IoMT-Imaging',        'MRI/CT High Bandwidth'),
(401,  'AI-Compute',          'Infiniband Fabric Emulation'),
(501,  'HFT-Mcast-A',         'Market Data Feed A'),
(601,  'Space-Telem',         'Satellite Telemetry'),
(701,  '5G-Control',          'RAN Control Plane'),
(801,  'Eduroam',             'Global Academic Wi-Fi'),
(901,  'Grid-SCADA',          'Power Grid Control'),
(951,  'Subsea-Mgmt',         'Optical Line Mgmt');


-- ==================================================================================
-- 4. DEVICES (Dynamic Linking)
-- ==================================================================================

-- Istanbul Core
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-core-sw01', '10.10.1.1', 'Cisco Nexus 9508', 'Cisco', 'NX-OS', 'active', 'Rack A1', 'FDO2211AAA', id FROM locations WHERE name = 'Istanbul HQ - Maslak';
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-core-sw02', '10.10.1.2', 'Cisco Nexus 9508', 'Cisco', 'NX-OS', 'active', 'Rack A1', 'FDO2211BBB', id FROM locations WHERE name = 'Istanbul HQ - Maslak';

-- Istanbul Firewalls
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-fw-edge-01', '10.10.1.254', 'Palo Alto PA-5220', 'Palo Alto', 'PAN-OS 10.1', 'active', 'Rack A2', '016001002233', id FROM locations WHERE name = 'Istanbul HQ - Maslak';
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-fw-edge-02', '10.10.1.253', 'Palo Alto PA-5220', 'Palo Alto', 'PAN-OS 10.1', 'active', 'Rack A2', '016001002234', id FROM locations WHERE name = 'Istanbul HQ - Maslak';

-- Ankara Core
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ank-core-rtr01', '10.20.1.1', 'Juniper MX480', 'Juniper', 'Junos 21.4', 'active', 'Rack B1', 'JN123AABB', id FROM locations WHERE name = 'Ankara Main Office - Sogutozu';

-- Izmir Distro
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'izm-dist-sw01', '10.30.1.1', 'Arista 7050SX3', 'Arista', 'EOS 4.28', 'active', 'Rack C3', 'ARI889977', id FROM locations WHERE name = 'Izmir Regional Office';

-- Bursa IoT
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'bur-iot-gw01', '10.40.1.1', 'Cisco IE-4000', 'Cisco', 'IOS-XE', 'active', 'Wall Mount', 'FOC112233', id FROM locations WHERE name = 'Bursa Factory';

-- Antalya Wifi
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ant-wifi-wlc', '10.50.1.10', 'Cisco 9800-L', 'Cisco', 'IOS-XE', 'active', 'Rack D1', 'WLC556677', id FROM locations WHERE name = 'Antalya Resort Hub';


-- Global Verticals (San Francisco)
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'sf-hq-core-01', '10.10.0.1', 'NCS 5500', 'Cisco', 'IOS-XR', 'active', id FROM locations WHERE name = 'Global Tech HQ';

INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'sf-iot-access-gw', '10.10.20.2', 'IGT-30D', 'Advantech', 'Linux', 'active', id FROM locations WHERE name = 'Global Tech HQ';

-- Berlin Factory
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'ber-factory-core', '10.20.0.1', 'IE-5000', 'Cisco', 'IOS-IE', 'active', id FROM locations WHERE name = 'Berlin Gigafactory';

-- Chicago HFT
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'chi-ex-fpga-01', '10.130.5.1', 'Metamako Meta48', 'Arista', 'MOS', 'active', id FROM locations WHERE name = 'HFT Trading Floor';

-- Manchester 5G
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'man-5g-core-01', '10.100.0.1', 'Nokia 7750 SR', 'Nokia', 'SR OS', 'active', id FROM locations WHERE name = '5G Edge Core';

-- 5G Radio Units (Generated)
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'man-5g-ru-' || lpad(i::text, 2, '0'), '10.100.5.' || i, 'AirScale RRH', 'Nokia', 'Embedded', 'active', (SELECT id FROM locations WHERE name = '5G Edge Core')
FROM generate_series(1, 20) AS s(i);

-- Austin Space
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'aus-starlink-gw', '10.90.0.1', 'Cobham Sailor', 'Cobham', 'SatOS', 'active', id FROM locations WHERE name = 'Deep Space Comms';

-- LEO Satellites (Generated)
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'sat-leo-' || lpad(i::text, 3, '0'), '100.100.1.' || i, 'Starlink v2.0', 'SpaceX', 'Linux-RT', 'active', (SELECT id FROM locations WHERE name = 'Deep Space Comms')
FROM generate_series(1, 10) AS s(i);


-- ==================================================================================
-- 5. INTERFACES (Dynamic Linking)
-- ==================================================================================

INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'Eth1/1', '10.10.1.1/30', '100Gbps', 'fiber', 'up', 'Link to FW-01' FROM devices WHERE hostname = 'ist-core-sw01';

INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'ge-0/0/0', '172.16.10.1/30', '10Gbps', 'fiber', 'up', 'WAN Link TurkTelekom' FROM devices WHERE hostname = 'ank-core-rtr01';

INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'Ethernet1', NULL, '10Gbps', 'fiber', 'up', 'Uplink to Core' FROM devices WHERE hostname = 'izm-dist-sw01';

INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'Gi0/1', '10.40.1.1/24', '1Gbps', 'copper', 'up', 'Factory Floor LAN' FROM devices WHERE hostname = 'bur-iot-gw01';

-- Global Interfaces
INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'Hu0/0/0/0', '10.10.0.1', '100Gbps', 'fiber', 'up', 'WAN Uplink' FROM devices WHERE hostname = 'sf-hq-core-01';

INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'eth1', '10.10.20.11', '100Mbps', 'copper', 'up', 'Lobby Fisheye Cam' FROM devices WHERE hostname = 'sf-iot-access-gw';

INSERT INTO interfaces (device_id, name, ip_address, speed, type, status, description)
SELECT id, 'Gi1/1', '10.20.0.1', '1Gbps', 'copper', 'up', 'Factory Backbone' FROM devices WHERE hostname = 'ber-factory-core';

-- Generated Interfaces (5G Fronthaul)
INSERT INTO interfaces (device_id, name, speed, type, status, description)
SELECT d.id, 'opt-1', '25Gbps', 'fiber', 'up', 'eCPRI Fronthaul'
FROM devices d WHERE d.hostname LIKE 'man-5g-ru-%';

-- Generated Interfaces (Satellites)
INSERT INTO interfaces (device_id, name, speed, type, status, description)
SELECT d.id, 'laser-isl-' || l.link_id, '100Gbps', 'laser', 'up', 'Inter-Satellite Laser Link'
FROM devices d 
CROSS JOIN generate_series(1, 4) AS l(link_id)
WHERE d.hostname LIKE 'sat-leo-%';


-- ==================================================================================
-- 6. MASSIVE SCALED DEPLOYMENTS
-- ==================================================================================

-- Singapore Stack
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'sin-campus-sw-01', '10.80.10.1', 'C9300-48P', 'Cisco', 'IOS-XE', 'active', id FROM locations WHERE name = 'Tech University';
INSERT INTO devices (hostname, ip, model, vendor, os, status, location_id)
SELECT 'sin-campus-sw-02', '10.80.10.2', 'C9300-48P', 'Cisco', 'IOS-XE', 'active', id FROM locations WHERE name = 'Tech University';

-- 144 Interfaces
INSERT INTO interfaces (device_id, name, speed, type, status, description)
SELECT d.id, 'GigabitEthernet1/0/' || i, '1Gbps', 'copper', 'up', 'Student PC'
FROM devices d, generate_series(1, 48) AS s(i)
WHERE d.hostname = 'sin-campus-sw-01';

INSERT INTO interfaces (device_id, name, speed, type, status, description)
SELECT d.id, 'GigabitEthernet1/0/' || i, '1Gbps', 'copper', 'up', 'Student PC'
FROM devices d, generate_series(1, 48) AS s(i)
WHERE d.hostname = 'sin-campus-sw-02';

