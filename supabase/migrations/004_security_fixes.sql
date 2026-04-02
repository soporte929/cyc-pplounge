-- 004_security_fixes.sql
-- Hardens RLS policies, restricts RPC access, and adds staff self-read policy.

-- ============================================================
-- 1. Customer PII exposure
-- Replace overly permissive anon_read_customers with a policy
-- that only allows reading a customer when a loyalty card
-- referencing that customer exists.
-- ============================================================
DROP POLICY IF EXISTS "anon_read_customers" ON customers;
CREATE POLICY "anon_read_via_card" ON customers FOR SELECT
  USING (id IN (SELECT customer_id FROM loyalty_cards));

-- ============================================================
-- 2. Rewards RLS — allow deactivated rewards still referenced
-- by an active loyalty card to remain readable.
-- ============================================================
DROP POLICY IF EXISTS "anon_read_active_rewards" ON rewards;
CREATE POLICY "anon_read_available_rewards" ON rewards FOR SELECT
  USING (
    is_active = true
    OR id IN (
      SELECT active_reward_id
      FROM loyalty_cards
      WHERE active_reward_id IS NOT NULL
    )
  );

-- ============================================================
-- 3. RPC functions — revoke public/anon access and restrict to
-- service_role so functions can only be called server-side.
-- ============================================================
REVOKE EXECUTE ON FUNCTION add_stamp FROM public, anon;
GRANT EXECUTE ON FUNCTION add_stamp TO service_role;

REVOKE EXECUTE ON FUNCTION redeem_reward FROM public, anon;
GRANT EXECUTE ON FUNCTION redeem_reward TO service_role;

-- ============================================================
-- 4. Staff RLS — allow authenticated users to read their own
-- staff record (needed by auth callback role-based redirect).
-- ============================================================
CREATE POLICY "auth_read_own_staff" ON staff FOR SELECT
  USING (auth.uid() = user_id);
