-- MASSIVE GLOBAL ENTERPRISE & IoT TOPOLOGY SEED
-- Scope: Multi-Industry Corporation
-- Verticals: Enterprise, IIoT, IoMT, Smart City, Telco, Space, AI/HPC, Subsea, HFT

-- ==================================================================================
-- 1. GLOBAL SITES
-- ==================================================================================
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-us-sf-01', 'Global Tech HQ', 'San Francisco', 'USA', 'Salesforce Tower');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-de-ber-01', 'Berlin Gigafactory', 'Berlin', 'Germany', 'Am Tesla Grohmann');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-us-bos-01', 'Boston Med Center', 'Boston', 'USA', 'Longwood Med Area');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-cn-sha-01', 'Shanghai Port Hub', 'Shanghai', 'China', 'Yangshan Port');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-uk-lon-01', 'Oxford St Flagship', 'London', 'UK', 'Oxford Street');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-ae-dxb-01', 'Smart City Control', 'Dubai', 'UAE', 'Museum of the Future');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-no-osl-01', 'Nordic Energy Hub', 'Oslo', 'Norway', 'Fjord City');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-sg-sin-01', 'Tech University', 'Singapore', 'Singapore', 'Clementi Road');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-us-aus-01', 'Deep Space Comms', 'Austin', 'USA', 'SpaceX Boca Chica');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-uk-man-01', '5G Edge Core', 'Manchester', 'UK', 'MediaCityUK');

-- NEW LOCATIONS
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-ca-mtl-01', 'AI Research Cluster', 'Montreal', 'Canada', 'Mila Institute');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-pt-lis-01', 'Subsea Cable Station', 'Lisbon', 'Portugal', 'Carcavelos Beach');
INSERT INTO locations (id, name, city, country, address) VALUES ('loc-us-chi-01', 'HFT Trading Floor', 'Chicago', 'USA', 'CME Group Data Center');


-- ==================================================================================
-- 2. SAN FRANCISCO HQ (Corporate IT + IoT)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-sf-core-01', 'sf-hq-core-01', '10.10.0.1', 'NCS 5500', 'Cisco', 'IOS-XR', 'active', 'loc-us-sf-01', NOW(), NOW()),
('dev-sf-fw-01', 'sf-hq-fw-01', '10.10.0.254', 'PA-7050', 'PaloAlto', 'PAN-OS', 'active', 'loc-us-sf-01', NOW(), NOW()),
('dev-sf-iot-gw-01', 'sf-iot-hvac-gw', '10.10.20.1', 'IGT-30D', 'Advantech', 'Linux', 'active', 'loc-us-sf-01', NOW(), NOW()),
('dev-sf-iot-gw-02', 'sf-iot-access-gw', '10.10.20.2', 'IGT-30D', 'Advantech', 'Linux', 'active', 'loc-us-sf-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-sf-core-01', 'dev-sf-core-01', 'Hu0/0/0/0', '10.10.0.1', 'AA:BB:CC:DD:00:01', '100Gbps', 'fiber', 'WAN Uplink', 'up'),
('if-sf-fw-01',   'dev-sf-fw-01',   'eth1/1',    '10.10.0.254', 'AA:BB:CC:DD:00:02', '40Gbps', 'fiber', 'Core Downlink', 'up'),
('if-sf-cam-01', 'dev-sf-iot-gw-02', 'eth1', '10.10.20.11', 'AA:BB:CC:DD:01:01', '100Mbps', 'copper', 'Lobby Fisheye Cam', 'up'),
('if-sf-rdr-01', 'dev-sf-iot-gw-02', 'rs485-1', '', 'AA:BB:CC:DD:01:03', '9600bps', 'serial', 'Main Entrance Reader', 'up'),
('if-sf-env-01', 'dev-sf-iot-gw-01', 'zigbee-1', '', 'ZZ:BB:CC:01:01:01', '250kbps', 'wireless', 'HVAC Temp Sensor Flr1', 'up');

-- ==================================================================================
-- 3. BERLIN GIGAFACTORY (Industrial IoT)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-ber-ot-core', 'ber-factory-core', '10.20.0.1', 'IE-5000', 'Cisco', 'IOS-IE', 'active', 'loc-de-ber-01', NOW(), NOW()),
('dev-ber-line-01', 'ber-assembly-line-01', '10.20.1.1', 'Stratix 5700', 'Rockwell', 'StratixOS', 'active', 'loc-de-ber-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-ber-core-01', 'dev-ber-ot-core', 'Gi1/1', '10.20.0.1', '00:1D:9C:00:00:01', '1Gbps', 'copper', 'Factory Backbone', 'up'),
('if-ber-plc-01', 'dev-ber-line-01', 'Fa1/1', '10.20.1.10', '00:1D:9C:A1:B2:C3', '100Mbps', 'copper', 'Siemens S7-1500 PLC', 'up'),
('if-ber-rbt-01', 'dev-ber-line-01', 'Fa1/2', '10.20.1.11', '00:1D:9C:A1:B2:C4', '1Gbps',   'copper', 'Kuka Robot Arm #8842', 'up');

-- ==================================================================================
-- 4. BOSTON MED CENTER (IoMT)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-bos-med-core', 'bos-med-core-01', '10.30.0.1', 'Catalyst 9400', 'Cisco', 'IOS-XE', 'active', 'loc-us-bos-01', NOW(), NOW()),
('dev-bos-rad-sw', 'bos-rad-access', '10.30.5.1', 'Catalyst 9200', 'Cisco', 'IOS-XE', 'active', 'loc-us-bos-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-bos-mri-01', 'dev-bos-rad-sw', 'Gi1/0/1', '10.30.5.10', '00:50:56:A1:00:01', '10Gbps', 'fiber', 'Siemens MRI Magnetom', 'up'),
('if-bos-mon-01', 'dev-bos-med-core', 'Gi2/0/1', '10.30.10.1', '00:A0:C9:00:00:01', '100Mbps', 'copper', 'Philips Patient Monitor', 'up');

-- ==================================================================================
-- 5. SHANGHAI LOGISTICS (Supply Chain)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-sha-rf-gw', 'sha-rfid-gateway-01', '10.40.1.1', 'FX7500', 'Zebra', 'ZebraOS', 'active', 'loc-cn-sha-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-sha-rf-01', 'dev-sha-rf-gw', 'ant-1', '', 'AA:FF:00:00:00:01', 'n/a', 'rfid', 'Loading Dock 1 Antenna', 'up');

-- ==================================================================================
-- 6. LONDON RETAIL (Retail IoT)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-lon-wlc', 'lon-store-wlc', '10.50.1.1', '9800-CL', 'Cisco', 'IOS-XE', 'active', 'loc-uk-lon-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-lon-pos-01', 'dev-lon-wlc', 'wlan-pos', '10.50.10.1', 'BC:EE:7B:00:00:01', '1Gbps', 'wireless', 'Tablet POS Register', 'up'),
('if-lon-bcn-01', 'dev-lon-wlc', 'ble-01',   '',           'BC:EE:7B:FF:FF:01', '1Mbps', 'ble',      'Bluetooth Beacon', 'up');

-- ==================================================================================
-- 7. DUBAI SMART CITY (Infrastructure)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-dxb-its-01', 'dxb-traffic-gw-01', '10.60.1.1', 'RuggedCom RX1500', 'Siemens', 'RUGGEDCOM-ROS', 'active', 'loc-ae-dxb-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-dxb-tl-01', 'dev-dxb-its-01', 'eth1', '10.60.1.10', 'DD:EE:11:00:00:01', '100Mbps', 'fiber', 'Traffic Light Node 1', 'up'),
('if-dxb-prk-01', 'dev-dxb-its-01', 'lorawan-1', '',      'DD:EE:11:FF:FF:01', '50kbps',  'lora',  'Smart Parking Sensor', 'up');

-- ==================================================================================
-- 8. NORDIC ENERGY (Renewable Grid)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-osl-scada', 'osl-grid-scada-01', '10.70.1.1', 'SEL-3530', 'SEL', 'RTAC', 'active', 'loc-no-osl-01', NOW(), NOW()),
('dev-osl-wind-01', 'turbine-01-ctrl', '10.70.1.11', 'Vestas V164', 'Vestas', 'Embedded', 'active', 'loc-no-osl-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-osl-iec-01',  'dev-osl-wind-01', 'eth0', '10.70.1.11', 'EE:EE:EE:02:02:01', '100Mbps', 'fiber', 'IEC 61850 Grid Interface', 'up');

-- ==================================================================================
-- 9. SINGAPORE UNIVERSITY (Education)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-sin-core-01', 'sin-uni-core', '10.80.0.1', 'Catalyst 9600', 'Cisco', 'IOS-XE', 'active', 'loc-sg-sin-01', NOW(), NOW()),

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-sin-core-01', 'dev-sin-core-01', 'Hu1/0/1', '10.80.0.1', 'CC:1C:00:80:00:01', '100Gbps', 'fiber', 'ISP Link', 'up');
('dev-sin-wlc-01', 'sin-uni-wlc-pri', '10.80.1.1', '9800-80', 'Cisco', 'IOS-XE', 'active', 'loc-sg-sin-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-sin-wlan-01', 'dev-sin-wlc-01', 'Vlan801', '10.80.80.1',  '', 'n/a', 'virtual', 'Eduroam Wi-Fi', 'up'),
('if-sin-wlan-02', 'dev-sin-wlc-01', 'Vlan802', '10.80.81.1',  '', 'n/a', 'virtual', 'Campus Guest Wi-Fi', 'up');

-- ==================================================================================
-- 10. AUSTIN SPACE STATION (Aerospace)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-aus-sat-gw', 'aus-starlink-gw', '10.90.0.1', 'Cobham Sailor', 'Cobham', 'SatOS', 'active', 'loc-us-aus-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-aus-rf-01', 'dev-aus-sat-gw', 'rf-uplink', '', '90:90:90:00:00:01', 'n/a', 'satellite', 'Ka-Band Uplink', 'up');

-- ==================================================================================
-- 11. MANCHESTER 5G HUB (Telco)
-- ==================================================================================
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-man-isp-core', 'man-5g-core-01', '10.100.0.1', 'Nokia 7750 SR', 'Nokia', 'SR OS', 'active', 'loc-uk-man-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-man-fronthaul', 'dev-man-isp-core', 'cpri-1', '', 'AA:BB:10:00:01:01', '25Gbps', 'fiber', 'CPRI Link', 'up');

-- ==================================================================================
-- 12. MONTREAL AI CLUSTER (HPC/AI) - Subnet 10.110.x.x
-- ==================================================================================
-- Infiniband Switches for Low Latency Training
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-mtl-ib-01', 'mtl-ib-spine-01', '10.110.0.1', 'QM8700', 'Mellanox', 'MLNX-OS', 'active', 'loc-ca-mtl-01', NOW(), NOW()),
('dev-mtl-ib-02', 'mtl-ib-spine-02', '10.110.0.2', 'QM8700', 'Mellanox', 'MLNX-OS', 'active', 'loc-ca-mtl-01', NOW(), NOW());

-- AI Compute Nodes (simulated as grid endpoints)
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-mtl-dgx-01', 'mtl-dgx-pod-01', '10.110.1.1', 'DGX A100', 'NVIDIA', 'Ubuntu-DGX', 'active', 'loc-ca-mtl-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-mtl-ib-01', 'dev-mtl-ib-01', 'IB1/1', '', '00:02:C9:00:00:01', '200Gbps', 'infiniband', 'Leaf Uplink', 'up'),
('if-mtl-ib-02', 'dev-mtl-dgx-01', 'ib0', '10.110.1.1', '00:02:C9:FF:FF:01', '200Gbps', 'infiniband', 'Compute Fabric', 'up'),
('if-mtl-mgmt-01','dev-mtl-dgx-01', 'eth0', '10.110.254.1', '00:02:C9:AA:AA:01', '1Gbps', 'copper', 'OOB Management', 'up');

-- ==================================================================================
-- 13. LISBON SUBSEA CABLE STATION (Optical Transport) - Subnet 10.120.x.x
-- ==================================================================================
-- DWDM Optical Transport System
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-lis-opt-01', 'lis-slte-01', '10.120.0.1', '6500 Packet-Optical', 'Ciena', 'SAOS', 'active', 'loc-pt-lis-01', NOW(), NOW()),
('dev-lis-opt-02', 'lis-pfe-01',  '10.120.0.2',  'Power Feed Eq',      'Infinera', 'Native', 'active', 'loc-pt-lis-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-lis-lambda-01', 'dev-lis-opt-01', 'OTU4-1-1', '', '', '100Gbps', 'optical', 'Wavelength to NY (Trans-Atlantic)', 'up'),
('if-lis-osc-01',    'dev-lis-opt-01', 'OSC',      '10.120.0.5', '', '100Mbps', 'optical', 'Optical Supervisory Channel', 'up');

-- ==================================================================================
-- 14. CHICAGO HFT TRADING FLOOR (FinTech) - Subnet 10.130.x.x
-- ==================================================================================
-- FPGA Switches (Nano-second latency)
INSERT INTO devices (id, hostname, ip, model, vendor, os, status, location_id, created_at, updated_at) VALUES 
('dev-chi-fpga-01', 'chi-algo-sw-01', '10.130.0.1', '7130 Connect', 'Arista', 'EOS', 'active', 'loc-us-chi-01', NOW(), NOW()),
('dev-chi-micro-01','chi-mw-radio-01','10.130.0.5', 'Horizon Quantum', 'DragonWave', 'RadioOS', 'active', 'loc-us-chi-01', NOW(), NOW());

INSERT INTO interfaces (id, device_id, name, ip_address, mac_address, speed, type, description, status) VALUES
('if-chi-l1-01', 'dev-chi-fpga-01', 'Et1', '', '70:B3:D5:00:00:01', '10Gbps', 'fiber', 'Exchange Feed A (L1 Bypass)', 'up'),
('if-chi-mw-01', 'dev-chi-micro-01','radio-0', '', '', '2Gbps', 'microwave', 'Low Latency Link to NY - Line of Sight', 'up');


-- ==================================================================================
-- 15. VLANS (Network Segmentation)
-- ==================================================================================
INSERT INTO vlans (id, vlan_id, name, description) VALUES
-- General
('vlan-10', 10, 'Data', 'Corporate User Data'),
('vlan-20', 20, 'Voice', 'VoIP Phones'),
('vlan-99', 99, 'Mgmt', 'Device Management'),
-- IoT Specific
('vlan-101', 101, 'IoT-Sensors', 'Zigbee/LoRa Gateways'),
('vlan-102', 102, 'IoT-CCTV', 'Physical Security Cameras'),
('vlan-103', 103, 'IoT-Access', 'Door Readers'),
-- Industrial (OT)
('vlan-201', 201, 'OT-PLC', 'Programmable Logic Controllers'),
('vlan-202', 202, 'OT-HMI', 'Human Machine Interfaces'),
('vlan-203', 203, 'OT-Robotics', 'Robotic Arms'),
-- Medical
('vlan-301', 301, 'IoMT-Imaging', 'MRI/CT High Bandwidth'),
('vlan-302', 302, 'IoMT-Patient', 'Sensitive Patient Monitoring'),
-- AI/HPC
('vlan-401', 401, 'AI-Compute', 'Infiniband Fabric Emulation'),
('vlan-402', 402, 'AI-Storage', 'NVMe-oF Traffic'),
-- HFT
('vlan-501', 501, 'HFT-Mcast-A', 'Market Data Feed A'),
('vlan-502', 502, 'HFT-Order', 'Order Entry Gateway'),
-- Space
('vlan-601', 601, 'Space-Telem', 'Satellite Telemetry'),
-- Telco
('vlan-701', 701, '5G-Control', 'RAN Control Plane'),
-- Education
('vlan-801', 801, 'Eduroam', 'Global Academic Wi-Fi'),
('vlan-802', 802, 'Campus-Guest', 'University Guest Network'),
-- Energy
('vlan-901', 901, 'Grid-SCADA', 'Power Grid Control'),
-- Subsea
('vlan-951', 951, 'Subsea-Mgmt', 'Optical Line Mgmt');
