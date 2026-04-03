"use client";

type Props = {
  data: Record<string, unknown>[];
  filename: string;
};

export function ExportCSV({ data, filename }: Props) {
  function handleExport() {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map(row => headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-[#1c1b1b] text-[#d0c5b2] px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#353534] transition-colors btn-press"
    >
      <span className="material-symbols-outlined text-base">download</span>
      CSV
    </button>
  );
}
