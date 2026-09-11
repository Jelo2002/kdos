-- =========================================================
-- SMP DATABASE MANAGEMENT & STAFF SUPERVISION SCHEMA
-- Run this in your Supabase or PostgreSQL SQL Editor
-- =========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CANDIDATES TABLE (Interview evaluations)
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ign VARCHAR(64) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    interviewer_ign VARCHAR(64) DEFAULT 'Staff',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast searching by IGN and filtering by status / rating
CREATE INDEX IF NOT EXISTS idx_candidates_ign ON candidates(ign);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_rating ON candidates(rating);

-- 2. STAFF MEMBERS TABLE (Staff roster & LOA tracking)
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ign VARCHAR(64) NOT NULL,
    discord_tag VARCHAR(64),
    role VARCHAR(32) NOT NULL CHECK (role IN ('Owner', 'Developer', 'Admin', 'Moderator', 'Interviewer', 'Builder')),
    department VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Hiatus', 'LOA', 'Inactive')),
    loa_reason TEXT,
    loa_return_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);

-- 3. DEPARTMENTS TABLE (Department deficiency standards)
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    min_required_staff INTEGER NOT NULL DEFAULT 2,
    description TEXT
);

-- SEED DEPARTMENTS
INSERT INTO departments (id, name, min_required_staff, description) VALUES
('recruitment', 'Recruitment & Interviews', 3, 'Handles applicant voice interviews, 1-5 star evaluations, and onboarding'),
('moderation', 'Server Moderation', 4, 'In-game chat moderation, anti-griefing, rule enforcement, ticket handling'),
('development', 'Development & Tech', 2, 'Plugin maintenance, server performance, database and discord bots'),
('building', 'Building & World Design', 2, 'Spawn builds, community hubs, road networks, and season resets'),
('events', 'Community & Events', 2, 'Weekly mini-games, lore events, and tournaments')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    min_required_staff = EXCLUDED.min_required_staff,
    description = EXCLUDED.description;

-- SEED SAMPLE CANDIDATES
INSERT INTO candidates (ign, rating, notes, interviewer_ign, status, tags) VALUES
('Grian', 5, 'Exceptional mega-builder with 8 years of survival experience. Very mature, polite on mic. Clear microphone and understands lore rules.', 'Avery_Dev', 'accepted', '["Builder", "Active", "Good Mic", "Chill"]'::jsonb),
('MumboJumbo', 5, 'Legendary redstone engineer. Demonstrated piston door vault and automated farm layouts. Super polite and high community vibe.', 'Kev_Owner', 'accepted', '["Redstone", "Active", "Good Mic"]'::jsonb),
('TechnoBlade99', 4, 'Skilled PvP player, active community member. Wants to participate in tournaments. Good mic, casual schedule.', 'Sarah_Mod', 'pending', '["PvP", "Active"]'::jsonb),
('GrieferTroll12', 1, 'Refused to read server rules. Questioned ban policies aggressively. Poor mic quality and background echo. Do not accept.', 'Sarah_Mod', 'rejected', '["Toxic", "Rule Issues"]'::jsonb),
('PixelCraftie', 3, 'Friendly builder, decent answers to lore questions. However, only plays 1-2 hours on weekends. Decent mic.', 'Avery_Dev', 'pending', '["Casual", "Builder"]'::jsonb);

-- SEED SAMPLE STAFF MEMBERS (Illustrating Active, LOA, and Hiatus)
INSERT INTO staff (ign, discord_tag, role, department, status, loa_reason, loa_return_date) VALUES
('Kev_Owner', 'kev_owner#0001', 'Owner', 'Management & Leadership', 'Active', NULL, NULL),
('Avery_Dev', 'avery.dev#1337', 'Developer', 'Development & Tech', 'Active', NULL, NULL),
('Sarah_Mod', 'sarah_staff#4421', 'Moderator', 'Server Moderation', 'Active', NULL, NULL),
('PixelWatcher', 'pixel_mod#8899', 'Moderator', 'Server Moderation', 'LOA', 'College midterm exams and study week', '2026-09-25'),
('BlockDoctor', 'blockdoc#2211', 'Interviewer', 'Recruitment & Interviews', 'Active', NULL, NULL),
('InterviewPro', 'interviewer_sam#9021', 'Interviewer', 'Recruitment & Interviews', 'Hiatus', 'Moving apartments and awaiting ISP installation', '2026-09-20'),
('EchoVoice', 'echovoice#7712', 'Interviewer', 'Recruitment & Interviews', 'LOA', 'Medical recovery leave', '2026-10-01'),
('MasterBuilderBob', 'bobbuilds#6632', 'Builder', 'Building & World Design', 'Active', NULL, NULL);
