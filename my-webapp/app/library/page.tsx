import { Navigation } from "@components/navigation";

const sampleItems = [
  { id: "sword-01", name: "Longsword", type: "Weapon", rarity: "Common", weight: "3 lb" },
  { id: "potion-01", name: "Healing Potion", type: "Consumable", rarity: "Uncommon", weight: "0.5 lb" },
  { id: "cloak-01", name: "Cloak of Elvenkind", type: "Armor", rarity: "Rare", weight: "1 lb" },
];

export default function LibraryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <Navigation />
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-extrabold mb-4">Vault Library</h1>
        <p className="text-slate-600 mb-6">Shared item templates and community catalog — import items into your vaults.</p>

        <section className="mb-6">
          <div className="flex gap-3">
            <input
              aria-label="Search library"
              className="flex-1 border rounded p-2"
              placeholder="Search items, types or rarity (not yet functional)"
              readOnly
            />
            <button
              aria-label="Open filters"
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              Filters
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {sampleItems.map((item) => (
            <div key={item.id} className="p-4 rounded-lg border flex flex-col justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-slate-600">{item.type} • {item.rarity} • {item.weight}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <a href={`/library/${item.id}`} className="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">View</a>
                <button className="text-sm px-3 py-1 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50">Import</button>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 text-sm text-slate-600">
          <p>Want to add your own templates? Provide a JSON/CSV import in the Vault settings or contribute to the community library.</p>
        </section>
      </div>
    </main>
  );
}