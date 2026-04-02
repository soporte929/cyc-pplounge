"use client";

import { useState } from "react";
import { InviteStaffForm } from "./invite-form";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

type Props = {
  staff: StaffMember[];
  currentUserId: string;
  createStaff: (data: FormData) => Promise<void>;
  toggleStaffActive: (data: FormData) => Promise<void>;
  changeRole: (data: FormData) => Promise<void>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StaffClient({
  staff,
  currentUserId,
  createStaff,
  toggleStaffActive,
  changeRole,
}: Props) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <>
      {/* Invite button */}
      <button
        onClick={() => setShowInvite(true)}
        className="inline-flex items-center gap-2 px-5 py-3 bg-[#e6c364] text-[#3d2e00] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#c9a84c] transition-colors"
      >
        <span className="material-symbols-outlined text-base leading-none">
          person_add
        </span>
        Crear Staff
      </button>

      {/* Table */}
      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1c1b1b]/50">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Miembro
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Email
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Rol
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Estado
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Alta
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4d4637]/5">
              {staff.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[#d0c5b2] text-sm"
                  >
                    No hay miembros del staff.
                  </td>
                </tr>
              ) : (
                staff.map((member) => {
                  const isSelf = member.id === currentUserId;
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#353534] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#e6c364]">
                              {getInitials(member.name)}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-[#e5e2e1]">
                              {member.name}
                            </span>
                            {isSelf && (
                              <span className="ml-2 text-[10px] text-[#e6c364]/60 font-bold uppercase tracking-widest">
                                (you)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#d0c5b2]">
                          {member.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 text-center">
                        {!isSelf ? (
                          <form action={changeRole}>
                            <input type="hidden" name="id" value={member.id} />
                            <select
                              name="role"
                              defaultValue={member.role}
                              onChange={(e) => {
                                const form = e.currentTarget.form;
                                if (form) form.requestSubmit();
                              }}
                              className="bg-[#1c1b1b] text-[#e5e2e1] text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1.5 border-0 focus:outline-none focus:ring-1 focus:ring-[#e6c364]/40 cursor-pointer"
                            >
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          </form>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#e6c364]">
                            {member.role}
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 text-center">
                        {member.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#353534] text-[#d0c5b2] text-[10px] font-bold uppercase tracking-widest">
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#d0c5b2]">
                          {formatDate(member.created_at)}
                        </span>
                      </td>

                      {/* Toggle active action */}
                      <td className="px-6 py-4 text-right">
                        {!isSelf ? (
                          <form action={toggleStaffActive}>
                            <input type="hidden" name="id" value={member.id} />
                            <input
                              type="hidden"
                              name="currentActive"
                              value={String(member.is_active)}
                            />
                            <button
                              type="submit"
                              className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors ${
                                member.is_active
                                  ? "text-red-400 hover:bg-red-500/10"
                                  : "text-[#e6c364] hover:bg-[#e6c364]/10"
                              }`}
                            >
                              {member.is_active ? "Desactivar" : "Activar"}
                            </button>
                          </form>
                        ) : (
                          <span className="text-[10px] text-[#d0c5b2]/40 uppercase tracking-widest">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite drawer */}
      {showInvite && (
        <InviteStaffForm
          onSubmit={createStaff}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
}
