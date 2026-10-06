-- ====================================================================
-- Migration: 0002_seed_data.sql
-- Description: Initial Master & Operational Data Seed for Dormitory OS
-- ====================================================================

-- 1. Buildings
INSERT INTO buildings (id, name, total_floors) VALUES
('b-1', 'อาคาร A', 3),
('b-2', 'อาคาร B', 3);

-- 2. Rooms
INSERT INTO rooms (id, building_id, room_number, floor, room_type, base_price, status, amenities_json) VALUES
('r-101', 'b-1', '101', 1, 'air', 4200.00, 'occupied', '["เครื่องปรับอากาศ","เครื่องทำน้ำอุ่น","เตียง 5 ฟุต","ตู้เสื้อผ้า","WiFi"]'),
('r-102', 'b-1', '102', 1, 'air', 4200.00, 'occupied', '["เครื่องปรับอากาศ","เครื่องทำน้ำอุ่น","เตียง 5 ฟุต","ตู้เสื้อผ้า","WiFi"]'),
('r-103', 'b-1', '103', 1, 'fan', 3200.00, 'vacant', '["พัดลมเพดาน","เตียง 5 ฟุต","ตู้เสื้อผ้า","ระเบียง"]'),
('r-104', 'b-1', '104', 1, 'air', 4200.00, 'maintenance', '["เครื่องปรับอากาศ","เครื่องทำน้ำอุ่น","เตียง 5 ฟุต","ตู้เสื้อผ้า"]'),
('r-201', 'b-1', '201', 2, 'air', 4500.00, 'occupied', '["เครื่องปรับอากาศ","เครื่องทำน้ำอุ่น","เตียง 6 ฟุต","ตู้เย็น","WiFi"]'),
('r-202', 'b-1', '202', 2, 'air', 4500.00, 'occupied', '["เครื่องปรับอากาศ","เครื่องทำน้ำอุ่น","เตียง 6 ฟุต","ตู้เย็น","ระเบียงชมวิว"]'),
('r-203', 'b-1', '203', 2, 'suite', 5800.00, 'vacant', '["ห้องสวีท 1 ห้องนอน","แอร์ 2 เครื่อง","ไมโครเวฟ","สมาร์ตทีวี 43 นิ้ว","โซฟา"]'),
('r-204', 'b-1', '204', 2, 'fan', 3500.00, 'reserved', '["พัดลมเพดาน","เตียง 5 ฟุต","ตู้เสื้อผ้า","ระเบียง"]');

-- 3. Tenants
INSERT INTO tenants (id, name, phone, id_card, email, line_id, emergency_contact_json) VALUES
('t-1', 'นายสมชาย ใจดี', '089-111-2233', '1-1002-00345-67-8', 'somchai@example.com', 'somchai_jd', '{"name":"นางสมศรี ใจดี","relation":"มารดา","phone":"081-999-8877"}'),
('t-2', 'น.ส.วิภาวรรณ สุขสมบัติ', '086-555-4321', '3-1005-00123-45-1', 'wipawan.s@example.com', 'wipa_w', '{"name":"นายไพโรจน์ สุขสมบัติ","relation":"บิดา","phone":"089-888-7766"}'),
('t-3', 'นายกิตติคุณ ศรีสวัสดิ์', '082-333-7890', '1-1020-00890-12-3', 'kittikun@example.com', 'kitti_s', '{"name":"น.ส.กานดา ศรีสวัสดิ์","relation":"พี่สาว","phone":"084-222-3344"}'),
('t-4', 'น.ส.แพรวา อมรเดช', '087-444-9012', '5-1033-00441-22-9', 'praewa@example.com', 'praewa_a', '{"name":"นางอำไพ อมรเดช","relation":"มารดา","phone":"081-333-1122"}');

-- 4. Contracts
INSERT INTO contracts (id, room_id, tenant_id, start_date, end_date, deposit_amount, monthly_rent, water_rate, electric_rate, common_fee, status) VALUES
('c-1', 'r-101', 't-1', '2026-01-01', '2026-12-31', 8400.00, 4200.00, 18.00, 8.00, 300.00, 'active'),
('c-2', 'r-102', 't-2', '2026-03-01', '2027-02-28', 8400.00, 4200.00, 18.00, 8.00, 300.00, 'active'),
('c-3', 'r-201', 't-3', '2026-02-15', '2027-02-14', 9000.00, 4500.00, 18.00, 8.00, 300.00, 'active'),
('c-4', 'r-202', 't-4', '2026-04-01', '2027-03-31', 9000.00, 4500.00, 18.00, 8.00, 300.00, 'active');

-- 5. Meter Readings
INSERT INTO meter_readings (id, room_id, billing_month, prev_water, curr_water, water_units, prev_electric, curr_electric, electric_units, is_spike_warning, recorded_by) VALUES
('m-101-202609', 'r-101', '2026-09', 310, 318, 8, 1420, 1530, 110, 0, 'Admin สมเกียรติ'),
('m-102-202609', 'r-102', '2026-09', 245, 251, 6, 980, 1075, 95, 0, 'Admin สมเกียรติ'),
('m-201-202609', 'r-201', '2026-09', 412, 422, 10, 2100, 2260, 160, 0, 'Admin สมเกียรติ'),
('m-202-202609', 'r-202', '2026-09', 180, 187, 7, 1250, 1385, 135, 0, 'Admin สมเกียรติ');

-- 6. Invoices
INSERT INTO invoices (id, invoice_number, room_id, tenant_id, contract_id, billing_month, total_amount, status, due_date, paid_at) VALUES
('inv-101-202609', 'INV-202609-101', 'r-101', 't-1', 'c-1', '2026-09', 5524.00, 'unpaid', '2026-10-05', NULL),
('inv-102-202609', 'INV-202609-102', 'r-102', 't-2', 'c-2', '2026-09', 5368.00, 'pending_verification', '2026-10-05', NULL),
('inv-201-202609', 'INV-202609-201', 'r-201', 't-3', 'c-3', '2026-09', 6260.00, 'paid', '2026-10-05', '2026-09-28 14:20:00'),
('inv-202-202609', 'INV-202609-202', 'r-202', 't-4', 'c-4', '2026-09', 6006.00, 'unpaid', '2026-10-05', NULL);

-- 7. Invoice Items
INSERT INTO invoice_items (id, invoice_id, item_type, description, units, unit_price, amount) VALUES
('it-1', 'inv-101-202609', 'rent', 'ค่าเช่าห้องพัก (ห้อง 101)', 1, 4200.00, 4200.00),
('it-2', 'inv-101-202609', 'water', 'ค่าน้ำประปา (8 หน่วย @ 18 บ.)', 8, 18.00, 144.00),
('it-3', 'inv-101-202609', 'electric', 'ค่าไฟฟ้า (110 หน่วย @ 8 บ.)', 110, 8.00, 880.00),
('it-4', 'inv-101-202609', 'common', 'ค่าบริการส่วนกลางและอินเทอร์เน็ต', 1, 300.00, 300.00);

-- 8. Audit Logs
INSERT INTO audit_logs (id, entity_type, entity_id, action, performed_by, details_json) VALUES
('aud-1', 'contracts', 'c-1', 'CREATE', 'Admin สมเกียรติ', '{"action":"Created lease contract for Room 101"}'),
('aud-2', 'invoices', 'inv-201-202609', 'APPROVE', 'Admin สมเกียรติ', '{"action":"Approved payment of 6,260 THB and marked invoice as PAID"}');
