-- REALISTIC MANUAL SEED DATA
-- Safe to run multiple times (Idempotent via WHERE NOT EXISTS checks)

-- ==========================================
-- 1. LOCATIONS (Turkey Major Cities & DCs)
-- ==========================================
INSERT INTO locations (name, city, country, address) VALUES
-- Istanbul Region
('Istanbul HQ - Maslak', 'Istanbul', 'Turkey', 'Maslak 1453 Plaza, Floor 25'),
('Istanbul DC - Esenyurt', 'Istanbul', 'Turkey', 'Esenyurt Data Center Campus, Hall 2'),
('Istanbul Branch - Kadikoy', 'Istanbul', 'Turkey', 'Bagdat Caddesi No:45'),
('Istanbul Backup Site', 'Istanbul', 'Turkey', 'Umraniye Technopark'),
-- Ankara Region
('Ankara Main Office - Sogutozu', 'Ankara', 'Turkey', 'Armada Tower B, Floor 10'),
('Ankara DR Site - Golbasi', 'Ankara', 'Turkey', 'Turk Telekom Campus'),
('Ankara R&D - ODTU', 'Ankara', 'Turkey', 'ODTU Teknokent Gallium Block'),
-- Izmir Region
('Izmir Regional Office', 'Izmir', 'Turkey', 'Folkart Towers A Block'),
('Izmir Warehouse - Aliaga', 'Izmir', 'Turkey', 'Aliaga Industrial Zone, Plot 55'),
-- Other Major Cities
('Bursa Factory', 'Bursa', 'Turkey', 'NOSAB Industrial Park'),
('Antalya Resort Hub', 'Antalya', 'Turkey', 'Lara Tourism Road'),
('Adana Logistics Center', 'Adana', 'Turkey', 'Incirlik Cargo Hub'),
('Trabzon Coastal Hub', 'Trabzon', 'Turkey', 'Black Sea Port Auth'),
('Gaziantep Trade Office', 'Gaziantep', 'Turkey', 'Organize Sanayi Bolgesi'),
('Kayseri Server Farm', 'Kayseri', 'Turkey', 'Erciyes Tech Valley'),
('Eskisehir Uni Campus', 'Eskisehir', 'Turkey', 'Anadolu Univ. Network Center'),
('Mersin Port Auth', 'Mersin', 'Turkey', 'Port Operations Bldg'),
('Konya Data Hub', 'Konya', 'Turkey', 'Selcuklu IT Center'),
('Diyarbakir Edge', 'Diyarbakir', 'Turkey', 'Kayapinar Office'),
('Samsun Fiber Node', 'Samsun', 'Turkey', 'Atakum POP Point')
ON CONFLICT DO NOTHING; -- (Or use WHERE NOT EXISTS if no unique constraint on name)


-- ==========================================
-- 2. VLANS (Network Segmentation)
-- ==========================================
INSERT INTO vlans (vlan_id, name, description) VALUES
(1, 'Default', 'Factory Default VLAN'),
(10, 'Mgmt_Network', 'OOB Management Network'),
(20, 'Server_Farm', 'Production Servers segment'),
(30, 'User_Data__Istanbul', 'Istanbul Office Users'),
(31, 'User_Data__Ankara', 'Ankara Office Users'),
(32, 'User_Data__Izmir', 'Izmir Office Users'),
(40, 'Voice_VoIP', 'IP Phones and PBX'),
(50, 'Guest_Wifi', 'Isolated Guest Access'),
(60, 'IoT_Sensors', 'Factory IoT Devices'),
(70, 'CCTV_Security', 'Security Cameras'),
(80, 'Storage_SAN', 'iSCSI Storage Traffic'),
(90, 'DMZ_Public', 'Public Facing Services'),
(100, 'Dev_Environment', 'Development and Testing'),
(110, 'Printers', 'Network Printers'),
(200, 'vMotion', 'VMware Live Migration'),
(666, 'Blackhole', 'Quarantine Network'),
(900, 'Native_VLAN', 'Native untagged traffic'),
(1001, 'L2_Interconnect_A', 'DCI Link A'),
(1002, 'L2_Interconnect_B', 'DCI Link B'),
(4094, 'Reserved', 'System Reserved')
ON CONFLICT DO NOTHING;


-- ==========================================
-- 3. DEVICES (Multi-Vendor, Realistic Roles)
-- ==========================================
-- Using CTEs to lookup Location IDs dynamically for readability

-- Istanbul HQ Core
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-core-sw01', '10.10.1.1', 'Cisco Nexus 9508', 'Cisco', 'NX-OS', 'active', 'Rack A1', 'FDO2211AAA', id FROM locations WHERE name = 'Istanbul HQ - Maslak'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-core-sw01');

INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-core-sw02', '10.10.1.2', 'Cisco Nexus 9508', 'Cisco', 'NX-OS', 'active', 'Rack A1', 'FDO2211BBB', id FROM locations WHERE name = 'Istanbul HQ - Maslak'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-core-sw02');

-- Istanbul Firewalls
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-fw-edge-01', '10.10.1.254', 'Palo Alto PA-5220', 'Palo Alto', 'PAN-OS 10.1', 'active', 'Rack A2', '016001002233', id FROM locations WHERE name = 'Istanbul HQ - Maslak'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-fw-edge-01');

INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-fw-edge-02', '10.10.1.253', 'Palo Alto PA-5220', 'Palo Alto', 'PAN-OS 10.1', 'active', 'Rack A2', '016001002234', id FROM locations WHERE name = 'Istanbul HQ - Maslak'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-fw-edge-02');

-- Ankara Core
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ank-core-rtr01', '10.20.1.1', 'Juniper MX480', 'Juniper', 'Junos 21.4', 'active', 'Rack B1', 'JN123AABB', id FROM locations WHERE name = 'Ankara Main Office - Sogutozu'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ank-core-rtr01');

-- Izmir Distro
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'izm-dist-sw01', '10.30.1.1', 'Arista 7050SX3', 'Arista', 'EOS 4.28', 'active', 'Rack C3', 'ARI889977', id FROM locations WHERE name = 'Izmir Regional Office'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'izm-dist-sw01');

-- Bursa Factory IoT
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'bur-iot-gw01', '10.40.1.1', 'Cisco IE-4000', 'Cisco', 'IOS-XE', 'active', 'Wall Mount', 'FOC112233', id FROM locations WHERE name = 'Bursa Factory'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'bur-iot-gw01');

-- Antalya Access
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ant-wifi-wlc', '10.50.1.10', 'Cisco 9800-L', 'Cisco', 'IOS-XE', 'active', 'Rack D1', 'WLC556677', id FROM locations WHERE name = 'Antalya Resort Hub'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ant-wifi-wlc');

-- Legacy/Maintenance Devices
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-legacy-sw', '192.168.1.100', 'Cisco 2960G', 'Cisco', 'IOS 12.2', 'maintenance', 'Rack Z9', 'FCQ098765', id FROM locations WHERE name = 'Istanbul Backup Site'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-legacy-sw');

INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ank-old-fw', '192.168.2.200', 'Fortinet 60D', 'Fortinet', 'FortiOS 6.0', 'offline', 'Shelf', 'FGT60D111222', id FROM locations WHERE name = 'Ankara DR Site - Golbasi'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ank-old-fw');

-- Load Balancers
INSERT INTO devices (hostname, ip, model, vendor, os, status, rack_position, serial_number, location_id)
SELECT 'ist-lb-01', '10.10.20.1', 'F5 BigIP i4800', 'F5', 'TMOS 16.1', 'active', 'Rack L1', 'F5BI112233', id FROM locations WHERE name = 'Istanbul DC - Esenyurt'
WHERE NOT EXISTS (SELECT 1 FROM devices WHERE hostname = 'ist-lb-01');


-- ==========================================
-- 4. INTERFACES (Diverse Types & Speeds)
-- ==========================================

-- Istanbul Core Switch 1 Interfaces
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Eth1/1', '10.10.1.1/30', '00:00:5E:00:53:01', '100Gbps', 'fiber', 'up', 'Link to FW-01'
FROM devices WHERE hostname = 'ist-core-sw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Eth1/1' AND device_id = devices.id);

INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Eth1/2', '10.10.1.5/30', '00:00:5E:00:53:02', '100Gbps', 'fiber', 'up', 'Link to FW-02'
FROM devices WHERE hostname = 'ist-core-sw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Eth1/2' AND device_id = devices.id);

INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Mgmt0', '192.168.99.10/24', '00:00:5E:00:53:99', '1Gbps', 'copper', 'up', 'OOB Management'
FROM devices WHERE hostname = 'ist-core-sw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Mgmt0' AND device_id = devices.id);

-- Ankara Router Interfaces
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'ge-0/0/0', '172.16.10.1/30', 'AA:BB:CC:DD:01:01', '10Gbps', 'fiber', 'up', 'WAN Link TurkTelekom'
FROM devices WHERE hostname = 'ank-core-rtr01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'ge-0/0/0' AND device_id = devices.id);

INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'ge-0/0/1', '172.16.20.1/30', 'AA:BB:CC:DD:01:02', '10Gbps', 'fiber', 'down', 'WAN Link Vodafone (Backup)'
FROM devices WHERE hostname = 'ank-core-rtr01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'ge-0/0/1' AND device_id = devices.id);

-- Izmir Switch Interfaces
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Ethernet1', NULL, '50:00:00:01:00:01', '10Gbps', 'fiber', 'up', 'Uplink to Core'
FROM devices WHERE hostname = 'izm-dist-sw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Ethernet1' AND device_id = devices.id);

INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Ethernet48', NULL, '50:00:00:01:00:48', '1Gbps', 'copper', 'up', 'Access Port - Printer'
FROM devices WHERE hostname = 'izm-dist-sw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Ethernet48' AND device_id = devices.id);

-- Bursa IoT Gateway
INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Gi0/1', '10.40.1.1/24', '11:22:33:44:55:66', '1Gbps', 'copper', 'up', 'Factory Floor LAN'
FROM devices WHERE hostname = 'bur-iot-gw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Gi0/1' AND device_id = devices.id);

INSERT INTO interfaces (device_id, name, ip_address, mac_address, speed, type, status, description)
SELECT id, 'Cellular0', '100.64.1.50', 'NULL', 'LTE', 'wireless', 'up', '4G Backup'
FROM devices WHERE hostname = 'bur-iot-gw01'
WHERE NOT EXISTS (SELECT 1 FROM interfaces WHERE name = 'Cellular0' AND device_id = devices.id);
