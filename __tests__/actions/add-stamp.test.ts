import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRpc = vi.fn();
const mockGetUser = vi.fn();
const mockSingle = vi.fn();

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

vi.mock("@/lib/email/resend", () => ({
  sendStampEmail: vi.fn(),
  sendRewardReadyEmail: vi.fn(),
}));

import { addStamp } from "@/app/(staff)/scan/actions";
import { sendStampEmail, sendRewardReadyEmail } from "@/lib/email/resend";

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
  // staff lookup is first from() call
  fromResults["staff"] = [chain];
}

function mockCustomerEmail(email: string) {
  const cardChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { customer_id: "cust-id" },
      error: null,
    }),
  };
  const custChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { email, name: "Test User" },
      error: null,
    }),
  };
  fromResults["loyalty_cards"] = [cardChain];
  fromResults["customers"] = [custChain];
}

describe("addStamp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromResults = {};
  });

  it("should add stamp successfully and send email", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockCustomerEmail("customer@test.com");
    mockRpc.mockResolvedValue({
      data: { success: true, stamps_current: 4, reward_unlocked: false, reward_name: "Shisha gratis" },
      error: null,
    });

    const result = await addStamp("00000000-0000-4000-a000-000000000001");

    expect(result.success).toBe(true);
    expect(result.stamps_current).toBe(4);
    expect(sendStampEmail).toHaveBeenCalledWith("customer@test.com", "Test User", 4, expect.any(Number));
  });

  it("should reject when cooldown is active", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: false, error: "cooldown", minutes_remaining: 42 },
      error: null,
    });

    const result = await addStamp("00000000-0000-4000-a000-000000000001");

    expect(result.success).toBe(false);
    expect(result.error).toBe("cooldown");
  });

  it("should reject when card does not exist", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: false, error: "card_not_found" },
      error: null,
    });

    const result = await addStamp("00000000-0000-4000-a000-000000000002");

    expect(result.success).toBe(false);
    expect(result.error).toBe("card_not_found");
  });

  it("should reject when card is deactivated", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockRpc.mockResolvedValue({
      data: { success: false, error: "card_not_found" },
      error: null,
    });

    const result = await addStamp("00000000-0000-4000-a000-000000000003");

    expect(result.success).toBe(false);
    expect(result.error).toBe("card_not_found");
  });

  it("should reject when staff is deactivated", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: false });

    const result = await addStamp("00000000-0000-4000-a000-000000000001");

    expect(result.success).toBe(false);
    expect(result.error).toBe("staff_inactive");
  });

  it("should send reward email when threshold is reached", async () => {
    mockStaffAuth({ id: "staff-uuid", is_active: true });
    mockCustomerEmail("customer@test.com");
    mockRpc.mockResolvedValue({
      data: { success: true, stamps_current: 10, reward_unlocked: true, reward_name: "Shisha gratis" },
      error: null,
    });

    const result = await addStamp("00000000-0000-4000-a000-000000000001");

    expect(result.success).toBe(true);
    expect(result.reward_unlocked).toBe(true);
    expect(sendStampEmail).toHaveBeenCalled();
    expect(sendRewardReadyEmail).toHaveBeenCalledWith("customer@test.com", "Test User", "Shisha gratis");
  });
});
