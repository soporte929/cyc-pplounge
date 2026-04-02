-- Seed data for Phi Phi Lounge
-- Run this ONCE after applying migrations

-- 1. Business config (singleton)
INSERT INTO business_config (business_name, primary_color, welcome_message, pass_strip_message)
VALUES (
  'Phi Phi Lounge',
  '#e6c364',
  'Bienvenido al programa de fidelización de Phi Phi Lounge',
  'Acumula sellos y gana recompensas'
)
ON CONFLICT DO NOTHING;

-- 2. Default reward (active)
INSERT INTO rewards (name, description, stamps_required, is_active)
VALUES (
  'Premium Shisha',
  'Una shisha premium de nuestra colección de autor, gratis.',
  10,
  true
)
ON CONFLICT DO NOTHING;
