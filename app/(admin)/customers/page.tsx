import { verifyAdmin } from "@/lib/auth/verify-admin";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/search-bar";
import { ExportCSV } from "@/components/export-csv";

const PAGE_SIZE = 10;

async function toggleCustomerActive(formData: FormData) {
  "use server";
  const auth = await verifyAdmin();
  if (!auth.authorized) return;
  const supabase = auth.supabase;

  const cardId = formData.get("cardId") as string;
  const currentActive = formData.get("currentActive") === "true";

  if (currentActive) {
    // Deactivating: clear stamps
    await supabase
      .from("loyalty_cards")
      .update({ is_active: false, stamps_current: 0, updated_at: new Date().toISOString() })
      .eq("id", cardId);
  } else {
    // Reactivating: fetch current active reward and restore active_reward_id
    const { data: activeReward } = await supabase
      .from("rewards")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    await supabase
      .from("loyalty_cards")
      .update({
        is_active: true,
        active_reward_id: activeReward?.id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardId);
  }

  revalidatePath("/customers");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;
  const searchQuery = params.q as string | undefined;

  const supabase = await createServiceClient();

  // Base query builder (used for both count and data)
  let countQuery = supabase
    .from("loyalty_cards")
    .select("id, customers!inner ( name, email )", { count: "exact", head: true });

  if (searchQuery) {
    countQuery = countQuery.or(
      `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
      { referencedTable: "customers" }
    );
  }

  const { count } = await countQuery;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Fetch page data: loyalty_cards joined with customers, ordered by last stamp
  let dataQuery = supabase
    .from("loyalty_cards")
    .select(
      `
      id,
      stamps_current,
      cycles_completed,
      is_active,
      updated_at,
      customers ( id, name, email, created_at )
    `
    )
    .order("updated_at", { ascending: false });

  if (searchQuery) {
    dataQuery = dataQuery.or(
      `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
      { referencedTable: "customers" }
    );
  }

  const { data: cards } = await dataQuery.range(offset, offset + PAGE_SIZE - 1);

  const csvData =
    cards?.map((card) => {
      const customer = card.customers as unknown as {
        name: string;
        email: string;
      } | null;
      return {
        nombre: customer?.name ?? "",
        email: customer?.email ?? "",
        sellos: card.stamps_current,
        ciclos: card.cycles_completed,
        estado: card.is_active ? "Activo" : "Inactivo",
      };
    }) ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between animate-fade-in-up">
        <div>
          <h1 className="text-4xl font-headline font-extrabold uppercase tracking-tighter text-[#e5e2e1]">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-[#d0c5b2]">
            {total.toLocaleString()} registrados en total
          </p>
        </div>
        <ExportCSV data={csvData} filename="clientes" />
      </div>

      {/* Search */}
      <div className="animate-fade-in-up">
        <SearchBar placeholder="Buscar por nombre o email…" />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/[0.03] animate-fade-in-up">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="bg-[#1c1b1b]/50">
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Cliente
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Sellos
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Ciclos
                </th>
                <th className="hidden md:table-cell px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Última actividad
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4d4637]/5">
              {!cards || cards.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-[#d0c5b2] text-sm"
                  >
                    No hay clientes.
                  </td>
                </tr>
              ) : (
                cards.map((card) => {
                  const customer = card.customers as unknown as {
                    id: string;
                    name: string;
                    email: string;
                    created_at: string;
                  } | null;
                  if (!customer) return null;

                  return (
                    <tr
                      key={card.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name + avatar + email stacked */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#353534] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#e6c364]">
                              {getInitials(customer.name)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-[#e5e2e1] truncate">
                              {customer.name}
                            </span>
                            <span className="block text-xs text-[#d0c5b2] truncate">
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Stamps */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-[#e6c364]">
                          {card.stamps_current}
                        </span>
                      </td>

                      {/* Cycles — hidden on mobile */}
                      <td className="hidden md:table-cell px-6 py-4 text-center">
                        <span className="text-sm text-[#e5e2e1]">
                          {card.cycles_completed}
                        </span>
                      </td>

                      {/* Last stamp — hidden on mobile */}
                      <td className="hidden md:table-cell px-6 py-4">
                        <span className="text-sm text-[#d0c5b2]">
                          {formatDate(card.updated_at)}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4 text-center">
                        {card.is_active ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-widest">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#353534] text-[#d0c5b2] text-[10px] font-bold uppercase tracking-widest">
                            Inactivo
                          </span>
                        )}
                      </td>

                      {/* Toggle action */}
                      <td className="px-6 py-4 text-right">
                        <form action={toggleCustomerActive}>
                          <input type="hidden" name="cardId" value={card.id} />
                          <input
                            type="hidden"
                            name="currentActive"
                            value={String(card.is_active)}
                          />
                          <button
                            type="submit"
                            className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors btn-press ${
                              card.is_active
                                ? "text-red-400 hover:bg-red-500/10"
                                : "text-[#e6c364] hover:bg-[#e6c364]/10"
                            }`}
                          >
                            {card.is_active ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#4d4637]/10 flex items-center justify-between">
            <p className="text-[10px] text-[#d0c5b2] uppercase tracking-widest">
              Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link
                  href={`/customers?page=${page - 1}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2] hover:text-[#e6c364] hover:bg-[#e6c364]/10 transition-colors"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/customers?page=${page + 1}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1b1b] text-[10px] font-bold uppercase tracking-widest text-[#d0c5b2] hover:text-[#e6c364] hover:bg-[#e6c364]/10 transition-colors"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
