"use client";

import { useState } from "react";
import { RewardForm } from "./reward-form";

type Reward = {
  id: string;
  name: string;
  description: string | null;
  stamps_required: number;
  is_active: boolean;
};

type Props = {
  rewards: Reward[];
  createReward: (data: FormData) => Promise<void>;
  updateReward: (data: FormData) => Promise<void>;
  toggleRewardActive: (data: FormData) => Promise<void>;
};

const REWARD_ICONS: Record<number, string> = {};

function getRewardIcon(index: number): string {
  const icons = ["redeem", "local_cafe", "restaurant", "wine_bar", "cake", "spa", "card_giftcard", "stars"];
  return icons[index % icons.length];
}

export function RewardsClient({
  rewards,
  createReward,
  updateReward,
  toggleRewardActive,
}: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  return (
    <>
      {/* New Reward trigger button — exposed via data attribute for server page */}
      <button
        id="new-reward-btn"
        onClick={() => setShowCreate(true)}
        className="inline-flex items-center gap-2 px-5 py-3 bg-[#e6c364] text-[#3d2e00] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a84c] transition-colors"
      >
        <span className="material-symbols-outlined text-base leading-none">
          add
        </span>
        New Reward
      </button>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rewards.map((reward, i) => (
          <div
            key={reward.id}
            className={`relative bg-[#1c1b1b] rounded-xl p-6 border transition-all duration-300 ${
              reward.is_active
                ? "border-white/5 hover:border-[#e6c364]/20"
                : "border-white/5 hover:border-[#e6c364]/20 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
            }`}
          >
            {/* Icon */}
            <div className="inline-flex items-center justify-center p-3 bg-[#353534] rounded-lg mb-4">
              <span className="material-symbols-outlined text-[#e6c364] text-2xl leading-none">
                {getRewardIcon(i)}
              </span>
            </div>

            {/* Active toggle */}
            <form action={toggleRewardActive} className="absolute top-6 right-6">
              <input type="hidden" name="id" value={reward.id} />
              <input
                type="hidden"
                name="currentActive"
                value={String(reward.is_active)}
              />
              <button
                type="submit"
                title={reward.is_active ? "Deactivate" : "Activate"}
                className="flex items-center"
              >
                <div
                  className={`w-8 h-4 rounded-full flex items-center transition-colors ${
                    reward.is_active ? "bg-[#e6c364]" : "bg-[#353534]"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${
                      reward.is_active ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </form>

            {/* Content */}
            <h3 className="text-base font-headline font-bold text-[#e5e2e1] tracking-tight">
              {reward.name}
            </h3>
            {reward.description && (
              <p className="mt-1 text-xs text-[#d0c5b2] leading-relaxed line-clamp-2">
                {reward.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#e6c364] text-base leading-none">
                confirmation_number
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                {reward.stamps_required} stamps
              </span>
            </div>

            {/* Edit button */}
            <button
              onClick={() => setEditingReward(reward)}
              className="absolute bottom-6 right-6 p-2 rounded-lg text-[#d0c5b2] hover:text-[#e6c364] hover:bg-[#e6c364]/10 transition-colors"
            >
              <span className="material-symbols-outlined text-base leading-none">
                edit
              </span>
            </button>
          </div>
        ))}

        {/* Add new placeholder card */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex flex-col items-center justify-center gap-3 bg-[#1c1b1b] rounded-xl p-6 border border-dashed border-[#4d4637]/40 hover:border-[#e6c364]/30 hover:bg-[#e6c364]/[0.02] transition-all min-h-[180px] group"
        >
          <div className="w-10 h-10 rounded-full bg-[#353534] flex items-center justify-center group-hover:bg-[#e6c364]/10 transition-colors">
            <span className="material-symbols-outlined text-[#d0c5b2] group-hover:text-[#e6c364] transition-colors text-xl leading-none">
              add
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2] group-hover:text-[#e6c364] transition-colors">
            Create New Reward
          </span>
        </button>
      </div>

      {/* Create form drawer */}
      {showCreate && (
        <RewardForm
          onSubmit={createReward}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit form drawer */}
      {editingReward && (
        <RewardForm
          initial={{
            id: editingReward.id,
            name: editingReward.name,
            description: editingReward.description ?? "",
            stamps_required: editingReward.stamps_required,
          }}
          onSubmit={updateReward}
          onClose={() => setEditingReward(null)}
        />
      )}
    </>
  );
}
