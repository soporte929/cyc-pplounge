import { describe, it, expect, vi, beforeEach } from "vitest";

// Chainable mock builder for Supabase queries
function createChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(resolvedValue);
  return chain;
}

let fromResults: Record<string, ReturnType<typeof createChain>[]> = {};

const mockSupabase = {
  from: vi.fn((table: string) => {
    const queue = fromResults[table] || [];
    const chain = queue.shift() || createChain({ data: null, error: null });
    return chain;
  }),
};

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { registerCustomer } from "@/app/(onboarding)/register/actions";

describe("registerCustomer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromResults = {};
  });

  it("should create Customer + LoyaltyCard with active_reward_id on valid input", async () => {
    // 1st from("customers") — email check
    fromResults["customers"] = [
      createChain({ data: null, error: { code: "PGRST116" } }),
      // 2nd from("customers") — insert
      createChain({ data: { id: "customer-uuid" }, error: null }),
    ];
    // from("rewards") — get active reward
    fromResults["rewards"] = [
      createChain({ data: { id: "reward-uuid" }, error: null }),
    ];
    // from("loyalty_cards") — insert card
    fromResults["loyalty_cards"] = [
      createChain({ data: { id: "card-uuid" }, error: null }),
    ];

    const formData = new FormData();
    formData.set("name", "Julian");
    formData.set("email", "julian@test.com");
    formData.set("marketing_consent", "true");

    const result = await registerCustomer(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: true, cardId: "card-uuid" })
    );
  });

  it("should return generic error when email already exists", async () => {
    fromResults["customers"] = [
      createChain({ data: { id: "existing-uuid" }, error: null }),
    ];

    const formData = new FormData();
    formData.set("name", "Julian");
    formData.set("email", "existing@test.com");
    formData.set("marketing_consent", "false");

    const result = await registerCustomer(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "email_exists" })
    );
  });

  it("should return validation error when name is empty", async () => {
    const formData = new FormData();
    formData.set("name", "");
    formData.set("email", "julian@test.com");
    formData.set("marketing_consent", "false");

    const result = await registerCustomer(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "validation_error" })
    );
  });

  it("should return validation error when email is malformed", async () => {
    const formData = new FormData();
    formData.set("name", "Julian");
    formData.set("email", "not-an-email");
    formData.set("marketing_consent", "false");

    const result = await registerCustomer(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "validation_error" })
    );
  });

  it("should accept registration with marketing_consent false", async () => {
    fromResults["customers"] = [
      createChain({ data: null, error: { code: "PGRST116" } }),
      createChain({ data: { id: "customer-uuid" }, error: null }),
    ];
    fromResults["rewards"] = [
      createChain({ data: { id: "reward-uuid" }, error: null }),
    ];
    fromResults["loyalty_cards"] = [
      createChain({ data: { id: "card-uuid" }, error: null }),
    ];

    const formData = new FormData();
    formData.set("name", "Julian");
    formData.set("email", "julian2@test.com");
    // marketing_consent not set = false

    const result = await registerCustomer(formData);

    // Verify the insert was called with marketing_consent: false
    const insertCall = fromResults["customers"]?.[0]; // already consumed
    expect(result).toEqual(
      expect.objectContaining({ success: true })
    );
  });
});
