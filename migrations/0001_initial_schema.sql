-- ====================================================================
-- Migration: 0001_initial_schema.sql
-- Description: Initial Relational Database Schema for Dormitory OS
-- Target Engine: MySQL / MariaDB (InnoDB) & Cloudflare D1 (SQLite)
-- ====================================================================

-- 1. Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    total_floors INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(36) PRIMARY KEY,
    building_id VARCHAR(36) NOT NULL,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    floor INT NOT NULL,
    room_type VARCHAR(20) NOT NULL CHECK(room_type IN ('fan', 'air', 'suite')),
    base_price DECIMAL(10,2) NOT NULL CHECK(base_price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'vacant' CHECK(status IN ('vacant', 'occupied', 'reserved', 'maintenance')),
    amenities_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE RESTRICT
);

-- 3. Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    id_card VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    line_id VARCHAR(50),
    emergency_contact_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL CHECK(deposit_amount >= 0),
    monthly_rent DECIMAL(10,2) NOT NULL CHECK(monthly_rent >= 0),
    water_rate DECIMAL(6,2) NOT NULL DEFAULT 18.00,
    electric_rate DECIMAL(6,2) NOT NULL DEFAULT 8.00,
    common_fee DECIMAL(10,2) NOT NULL DEFAULT 300.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
);

-- 5. Meter Readings Table
CREATE TABLE IF NOT EXISTS meter_readings (
    id VARCHAR(36) PRIMARY KEY,
    room_id VARCHAR(36) NOT NULL,
    billing_month VARCHAR(7) NOT NULL,
    prev_water INT NOT NULL DEFAULT 0,
    curr_water INT NOT NULL,
    water_units INT NOT NULL CHECK(water_units >= 0),
    prev_electric INT NOT NULL DEFAULT 0,
    curr_electric INT NOT NULL,
    electric_units INT NOT NULL CHECK(electric_units >= 0),
    is_spike_warning BOOLEAN DEFAULT 0,
    is_reset BOOLEAN DEFAULT 0,
    recorded_by VARCHAR(100) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    UNIQUE(room_id, billing_month)
);

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    room_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36) NOT NULL,
    contract_id VARCHAR(36),
    billing_month VARCHAR(7) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL CHECK(total_amount >= 0),
    status VARCHAR(25) NOT NULL DEFAULT 'unpaid' CHECK(status IN ('draft', 'unpaid', 'pending_verification', 'paid', 'overdue', 'void')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    UNIQUE(room_id, billing_month)
);

-- 7. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    units INT DEFAULT 1,
    unit_price DECIMAL(10,2) DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL CHECK(amount >= 0),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 8. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    invoice_id VARCHAR(36) NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK(amount > 0),
    slip_url TEXT NOT NULL,
    slip_hash VARCHAR(64) NOT NULL UNIQUE,
    transfer_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    reject_reason TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP NULL,
    receipt_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- 9. Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
    id VARCHAR(36) PRIMARY KEY,
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id VARCHAR(36) NOT NULL,
    payment_id VARCHAR(36) NOT NULL,
    room_id VARCHAR(36) NOT NULL,
    tenant_name VARCHAR(150) NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    billing_month VARCHAR(7) NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK(amount > 0),
    issued_by VARCHAR(100) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE RESTRICT,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- 10. Maintenance Tickets Table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(36) PRIMARY KEY,
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    room_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36),
    category VARCHAR(30) NOT NULL CHECK(category IN ('air', 'plumbing', 'electrical', 'furniture', 'other')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    image_urls_json TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'acknowledged', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
    assigned_technician VARCHAR(100),
    cost DECIMAL(10,2) DEFAULT 0,
    cost_paid_by VARCHAR(10) DEFAULT 'dorm' CHECK(cost_paid_by IN ('dorm', 'tenant')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- 11. Audit Logs Table (Immutable Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details_json TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_room_month_status ON invoices(room_id, billing_month, status);
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date ON invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON maintenance_tickets(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenants_phone ON tenants(phone);
CREATE INDEX IF NOT EXISTS idx_audit_entity_time ON audit_logs(entity_type, entity_id, timestamp DESC);
