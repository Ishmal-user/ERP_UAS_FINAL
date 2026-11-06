-- Migration 010: Make receipts.created_by nullable
-- Date: 2026-10-31
-- Purpose: Allow receipts to be created without a user reference

ALTER TABLE receipts ALTER COLUMN created_by DROP NOT NULL;
