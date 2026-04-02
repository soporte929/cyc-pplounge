import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

// These tests run against the REAL Supabase instance with the ANON key
// to verify that RLS policies are correctly configured.
// They test what a browser client (unauthenticated) can and cannot access.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Skip tests if env vars not available
const canRun = supabaseUrl && supabaseAnonKey;

describe.skipIf(!canRun)("RLS Policies — anon key access", () => {
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  it("should NOT allow anon to read stamps directly", async () => {
    const { data, error } = await supabase.from("stamps").select("*");

    // RLS policy USING(false) should return empty or error
    expect(data).toEqual([]);
  });

  it("should NOT allow anon to read staff directly", async () => {
    const { data, error } = await supabase.from("staff").select("*");

    expect(data).toEqual([]);
  });

  it("should NOT allow anon to read redemptions directly", async () => {
    const { data, error } = await supabase.from("redemptions").select("*");

    expect(data).toEqual([]);
  });

  it("should allow anon to read loyalty_cards", async () => {
    const { data, error } = await supabase
      .from("loyalty_cards")
      .select("id, stamps_current, is_active")
      .limit(1);

    // Should not error (RLS allows SELECT)
    expect(error).toBeNull();
    // data could be empty array if no cards exist, that's ok
    expect(Array.isArray(data)).toBe(true);
  });

  it("should allow anon to read active rewards only", async () => {
    const { data, error } = await supabase
      .from("rewards")
      .select("id, name, stamps_required, is_active");

    expect(error).toBeNull();
    // All returned rewards should be active (RLS filters inactive)
    if (data && data.length > 0) {
      for (const reward of data) {
        expect(reward.is_active).toBe(true);
      }
    }
  });
});
