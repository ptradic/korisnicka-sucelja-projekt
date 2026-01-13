const tools = [
  { href: "/dm-tools/loot-generator", title: "Loot Generator", desc: "Generate random treasure by CR, rarity or table." },
  { href: "/dm-tools/random-table", title: "Random Tables", desc: "Customizable tables for encounters, loot and events." },
  { href: "/dm-tools/session-notes", title: "Session Notes", desc: "Quick session notes with export to PDF/JSON." },
  { href: "/dm-tools/merchant-pricing", title: "Merchant Pricing", desc: "Bulk price editor and inventory value calculator." },
];

export default function DMToolsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-extrabold mb-4">DM Tools</h1>
        <p className="text-slate-600 mb-6">Lightweight utilities to help Game Masters manage loot, shops and sessions.</p>

        <section className="grid gap-4 sm:grid-cols-2">
          {tools.map((t) => (
            <article key={t.href} className="p-4 rounded-lg border flex flex-col justify-between">
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{t.desc}</p>
              </div>
              <div className="mt-4">
                <a href={t.href} className="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Open tool</a>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 text-sm text-slate-600">
          <p>Want one of these expanded into an interactive component (e.g., an in-page loot generator)? Tell me which tool and I will scaffold it next.</p>
        </section>
      </div>
    </main>
  );
}