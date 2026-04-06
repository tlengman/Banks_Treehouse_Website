-- Banks Treehouse D1 Database Schema
-- Migration: 0001_initial_schema
-- Created: 2026-04-06

-- Guests table: stores all guest contact records
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'contact'
);

CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_source ON guests(source);

-- Waivers table: stores signed liability waivers
CREATE TABLE IF NOT EXISTS waivers (
  id TEXT PRIMARY KEY,
  guest_id TEXT,
  signed_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  waiver_version TEXT NOT NULL DEFAULT '1.0',
  signature_data TEXT NOT NULL,
  pdf_url TEXT,
  FOREIGN KEY (guest_id) REFERENCES guests(id)
);

CREATE INDEX IF NOT EXISTS idx_waivers_guest_id ON waivers(guest_id);

-- Email subscribers table: newsletter/marketing list
CREATE TABLE IF NOT EXISTS email_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
  source TEXT NOT NULL DEFAULT 'homepage',
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON email_subscribers(status);

-- Contact messages table: form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE INDEX IF NOT EXISTS idx_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON contact_messages(created_at);
