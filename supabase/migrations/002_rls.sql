-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_config ENABLE ROW LEVEL SECURITY;

-- Customers: anon can read (Server Component filters visible fields)
CREATE POLICY "anon_read_customers" ON customers FOR SELECT USING (true);

-- Loyalty Cards: anon can read by UUID (public card view)
CREATE POLICY "anon_read_loyalty_cards" ON loyalty_cards FOR SELECT USING (true);

-- Stamps: only via service_role or RPC SECURITY DEFINER
CREATE POLICY "service_role_only_stamps" ON stamps FOR ALL USING (false);

-- Rewards: anon can read active rewards
CREATE POLICY "anon_read_active_rewards" ON rewards FOR SELECT USING (is_active = true);

-- Redemptions: only service_role
CREATE POLICY "service_role_only_redemptions" ON redemptions FOR ALL USING (false);

-- Staff: only service_role
CREATE POLICY "service_role_only_staff" ON staff FOR ALL USING (false);

-- Business Config: anon can read (public business info)
CREATE POLICY "anon_read_business_config" ON business_config FOR SELECT USING (true);
