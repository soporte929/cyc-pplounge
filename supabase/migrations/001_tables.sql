-- Customers
CREATE TABLE customers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  marketing_consent BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Staff (includes admin)
CREATE TABLE staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
  is_active  BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rewards
CREATE TABLE rewards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  stamps_required INT NOT NULL DEFAULT 10 CHECK (stamps_required > 0),
  is_active       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Loyalty Cards (1 per customer)
CREATE TABLE loyalty_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id       UUID UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  stamps_current    INT DEFAULT 0 CHECK (stamps_current >= 0),
  cycles_completed  INT DEFAULT 0,
  active_reward_id  UUID REFERENCES rewards(id),
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Stamps history
CREATE TABLE stamps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id    UUID REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  added_by   UUID REFERENCES staff(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  notes      TEXT
);

-- Redemptions history
CREATE TABLE redemptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id      UUID REFERENCES loyalty_cards(id) ON DELETE CASCADE,
  reward_id    UUID REFERENCES rewards(id),
  redeemed_by  UUID REFERENCES staff(id),
  redeemed_at  TIMESTAMPTZ DEFAULT now(),
  cycle_number INT NOT NULL CHECK (cycle_number > 0)
);

-- Business config (singleton)
CREATE TABLE business_config (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name      TEXT NOT NULL,
  logo_url           TEXT,
  primary_color      TEXT DEFAULT '#e6c364',
  welcome_message    TEXT,
  pass_strip_message TEXT,
  updated_at         TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_stamps_card_id_created ON stamps(card_id, created_at DESC);
CREATE INDEX idx_loyalty_cards_customer ON loyalty_cards(customer_id);
CREATE INDEX idx_redemptions_card ON redemptions(card_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
