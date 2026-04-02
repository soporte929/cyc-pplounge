-- Add stamp with atomic cooldown (prevents race conditions)
CREATE OR REPLACE FUNCTION add_stamp(
  p_card_id UUID,
  p_staff_id UUID,
  p_cooldown_minutes INT DEFAULT 60
)
RETURNS JSON AS $$
DECLARE
  v_last_stamp TIMESTAMPTZ;
  v_card RECORD;
  v_minutes_remaining INT;
  v_new_count INT;
  v_reward RECORD;
  v_reward_unlocked BOOLEAN := false;
BEGIN
  -- Lock the card row to prevent concurrent stamps
  SELECT * INTO v_card FROM loyalty_cards
    WHERE id = p_card_id AND is_active = true
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'card_not_found');
  END IF;

  -- Check cooldown
  SELECT created_at INTO v_last_stamp FROM stamps
    WHERE card_id = p_card_id ORDER BY created_at DESC LIMIT 1;

  IF v_last_stamp IS NOT NULL AND
     v_last_stamp > now() - (p_cooldown_minutes || ' minutes')::interval THEN
    v_minutes_remaining := CEIL(EXTRACT(EPOCH FROM
      (v_last_stamp + (p_cooldown_minutes || ' minutes')::interval - now())) / 60);
    RETURN json_build_object('success', false, 'error', 'cooldown',
      'minutes_remaining', v_minutes_remaining);
  END IF;

  -- Insert stamp
  INSERT INTO stamps (card_id, added_by) VALUES (p_card_id, p_staff_id);

  -- Increment counter
  v_new_count := v_card.stamps_current + 1;
  UPDATE loyalty_cards SET stamps_current = v_new_count, updated_at = now()
    WHERE id = p_card_id;

  -- Check if reward unlocked (exactly at threshold)
  SELECT * INTO v_reward FROM rewards WHERE id = v_card.active_reward_id;
  IF v_reward.id IS NOT NULL AND v_new_count = v_reward.stamps_required THEN
    v_reward_unlocked := true;
  END IF;

  RETURN json_build_object(
    'success', true,
    'stamps_current', v_new_count,
    'reward_unlocked', v_reward_unlocked,
    'reward_name', v_reward.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Redeem reward with leftover stamps
CREATE OR REPLACE FUNCTION redeem_reward(
  p_card_id UUID,
  p_staff_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_card RECORD;
  v_reward RECORD;
  v_active_reward RECORD;
  v_new_stamps INT;
  v_cycle INT;
BEGIN
  SELECT * INTO v_card FROM loyalty_cards
    WHERE id = p_card_id AND is_active = true
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'card_not_found');
  END IF;

  -- Get the reward assigned to this cycle
  SELECT * INTO v_reward FROM rewards WHERE id = v_card.active_reward_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'no_reward_assigned');
  END IF;

  -- Check threshold reached
  IF v_card.stamps_current < v_reward.stamps_required THEN
    RETURN json_build_object('success', false, 'error', 'threshold_not_reached',
      'stamps_current', v_card.stamps_current,
      'stamps_required', v_reward.stamps_required);
  END IF;

  -- Calculate remaining stamps and new cycle
  v_new_stamps := v_card.stamps_current - v_reward.stamps_required;
  v_cycle := v_card.cycles_completed + 1;

  -- Get current active reward for next cycle
  SELECT * INTO v_active_reward FROM rewards WHERE is_active = true LIMIT 1;

  -- Create redemption
  INSERT INTO redemptions (card_id, reward_id, redeemed_by, cycle_number)
    VALUES (p_card_id, v_reward.id, p_staff_id, v_cycle);

  -- Update card: new cycle
  UPDATE loyalty_cards SET
    stamps_current = v_new_stamps,
    cycles_completed = v_cycle,
    active_reward_id = COALESCE(v_active_reward.id, v_reward.id),
    updated_at = now()
  WHERE id = p_card_id;

  RETURN json_build_object(
    'success', true,
    'stamps_remaining', v_new_stamps,
    'cycle_completed', v_cycle,
    'reward_redeemed', v_reward.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: enforce single active reward
CREATE OR REPLACE FUNCTION enforce_single_active_reward()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE rewards SET is_active = false
      WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_single_active_reward
  BEFORE INSERT OR UPDATE OF is_active ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_reward();
