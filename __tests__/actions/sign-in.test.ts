import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSignInWithPassword = vi.fn();

const mockSupabase = {
  auth: {
    signInWithPassword: mockSignInWithPassword,
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createAnonClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

import { signInWithPassword } from "@/app/(staff)/login/actions";

describe("signInWithPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return success for valid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.set("email", "staff@lounge.com");
    formData.set("password", "securepass123");

    const result = await signInWithPassword(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: true })
    );
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "staff@lounge.com",
      password: "securepass123",
    });
  });

  it("should return validation error for invalid email", async () => {
    const formData = new FormData();
    formData.set("email", "not-an-email");
    formData.set("password", "securepass123");

    const result = await signInWithPassword(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "validation_error" })
    );
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("should return validation error for short password", async () => {
    const formData = new FormData();
    formData.set("email", "staff@lounge.com");
    formData.set("password", "12345");

    const result = await signInWithPassword(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "validation_error" })
    );
  });

  it("should return auth_error for wrong credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const formData = new FormData();
    formData.set("email", "staff@lounge.com");
    formData.set("password", "wrongpass");

    const result = await signInWithPassword(formData);

    expect(result).toEqual(
      expect.objectContaining({ success: false, error: "auth_error" })
    );
  });
});
