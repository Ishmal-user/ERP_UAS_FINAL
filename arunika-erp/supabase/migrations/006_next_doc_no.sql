-- Migration 006: Next document number function
-- Date: 2026-10-28
-- Purpose: Generate sequential document numbers with prefix

CREATE OR REPLACE FUNCTION next_doc_no(p_doc_type text, p_prefix text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_n integer;
BEGIN
  INSERT INTO doc_sequences (doc_type, prefix, last_number)
  VALUES (p_doc_type, p_prefix, 1)
  ON CONFLICT (doc_type)
  DO UPDATE SET last_number = doc_sequences.last_number + 1, updated_at = now()
  RETURNING last_number INTO v_n;
  RETURN p_prefix || lpad(v_n::text, 5, '0');
END;
$$;
REVOKE ALL ON FUNCTION next_doc_no(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION next_doc_no(text, text) TO service_role;
