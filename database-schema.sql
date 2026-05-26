-- VitalCare Database Schema for Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor

-- Roles table
CREATE TABLE roles (
  role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500)
);

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('Super Administrator', 'Full system access'),
('Admin', 'Operational management'),
('Nurse', 'Visit management and vitals recording'),
('Member', 'Personal health access'),
('Family Viewer', 'Read-only access to assigned member'),
('Corporate HR', 'Aggregate employee wellness access'),
('Auditor', 'Compliance and audit access');

-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(500) NOT NULL,
  role_id UUID REFERENCES roles(role_id),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription Plans table
CREATE TABLE subscription_plans (
  subscription_plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name VARCHAR(100) NOT NULL,
  monthly_price DECIMAL(18,2) NOT NULL,
  max_members INT NOT NULL,
  visits_per_month INT NOT NULL,
  is_corporate BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- Insert default plans
INSERT INTO subscription_plans (plan_name, monthly_price, max_members, visits_per_month, is_corporate) VALUES
('Basic', 49.99, 1, 2, false),
('Family', 99.99, 4, 8, false),
('Premium', 149.99, 6, 12, false),
('Corporate', 499.99, 50, 100, true);

-- Members table
CREATE TABLE members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  member_code VARCHAR(20) UNIQUE NOT NULL,
  dob DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  zip_code VARCHAR(20),
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  assigned_nurse_id UUID,
  subscription_plan_id UUID REFERENCES subscription_plans(subscription_plan_id),
  health_score DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Nurses table
CREATE TABLE nurses (
  nurse_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  license_number VARCHAR(100) UNIQUE NOT NULL,
  certification VARCHAR(500),
  zone VARCHAR(100),
  rating DECIMAL(3,2) DEFAULT 0,
  pay_rate DECIMAL(18,2),
  availability_status VARCHAR(50) DEFAULT 'Available',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add FK for assigned nurse
ALTER TABLE members ADD CONSTRAINT fk_assigned_nurse 
  FOREIGN KEY (assigned_nurse_id) REFERENCES nurses(nurse_id);

-- Family Member Access table
CREATE TABLE family_member_access (
  family_access_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(member_id),
  viewer_user_id UUID REFERENCES users(user_id),
  relationship VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(member_id),
  subscription_plan_id UUID REFERENCES subscription_plans(subscription_plan_id),
  stripe_customer_id VARCHAR(200),
  stripe_subscription_id VARCHAR(200),
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visits table
CREATE TABLE visits (
  visit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(member_id),
  nurse_id UUID REFERENCES nurses(nurse_id),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status VARCHAR(50) DEFAULT 'Scheduled',
  notes TEXT,
  nurse_notes TEXT,
  cancellation_reason TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vitals table
CREATE TABLE vitals (
  vital_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES visits(visit_id),
  member_id UUID REFERENCES members(member_id),
  blood_pressure_systolic INT,
  blood_pressure_diastolic INT,
  heart_rate INT,
  temperature DECIMAL(4,1),
  oxygen_saturation DECIMAL(4,1),
  weight DECIMAL(5,2),
  blood_glucose DECIMAL(5,1),
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurses ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
