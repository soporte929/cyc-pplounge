import { describe, it, expect, vi, beforeEach } from "vitest";

const CARD_UUID = "00000000-0000-4000-a000-000000000001";

const mockRpc = vi.fn();
const mockGetUser = vi.fn();

let fromResults: Record<string, { select: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn>; single: ReturnType<typeof vi.fn> }[]> = {};

const mockSupabase = {
  rpc: mockRpc,
  auth: { getUser: mockGetUser, signOut: vi.fn() },
  from: vi.fn((table: string) => {
    const queue = fromResults[table] || [];
    const chain = queue.shift() || {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    return chain;
  }),
};

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { redeemReward } from "@/app/(staff)/redeem/[cardId]/actions";

function mockStaffAuth(staffData: { id: string; is_active: boolean } | null) {
  mockGetUser.mockResolvedValue({ data: { user: { id: "auth-user-id" } }, error: null });
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: staffData,
      error: staffData ? null : { code: "PGRST116" },
    }),
  };
  fromResults["staff"] = [chain];
}

describe("redeemReward", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromResults = {};
  });

  it("should redeem successfully with stamps reduced and cycle incremented", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: true, stamps_remaining: 2, cycle_completed: 1, reward_redeemed: "Shisha gratis" },
      error: null,
    });

    const result = await redeemReward(CARD_UUID);

    expect(result.success).toBe(true);
    expect(result.stamps_remaining).toBe(2);
    expect(result.cycle_completed).toBe(1);
    expect(result.reward_redeemed).toBe("Shisha gratis");
  });

  it("should reject when stamps are insufficient", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: false, error: "threshold_not_reached", stamps_current: 7, stamps_required: 10 },
      error: null,
    });

    const result = await redeemReward(CARD_UUID);

    expect(result.success).toBe(false);
    expect(result.error).toBe("threshold_not_reached");
  });

  it("should reject when card does not exist", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: false, error: "card_not_found" },
      error: null,
    });

    const result = await redeemReward(CARD_UUID);

    expect(result.success).toBe(false);
    expect(result.error).toBe("card_not_found");
  });

  it("should keep leftover stamps after redemption (12 - 10 = 2)", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: true, stamps_remaining: 2, cycle_completed: 3, reward_redeemed: "Shisha gratis" },
      error: null,
    });

    const result = await redeemReward(CARD_UUID);

    expect(result.success).toBe(true);
    expect(result.stamps_remaining).toBe(2);
  });

  it("should reject when staff is deactivated", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: false });

    const result = await redeemReward(CARD_UUID);

    expect(result.success).toBe(false);
    expect(result.error).toBe("staff_inactive");
  });
});
