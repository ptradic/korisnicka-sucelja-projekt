import { Navigation } from "@components/navigation";

const demos = [
  { id: "party-vault", title: "Party Vault", desc: "Typical party shared inventory with consumables and gear." },
  { id: "merchant-inventory", title: "Merchant Inventory", desc: "Shop stock with prices and bulk items." },
  { id: "treasure-hoard", title: "Treasure Hoard", desc: "Randomized loot examples and preset treasure tables." },
];

export default function DemosPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <Navigation />
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-extrabold mb-4">Demos & Example Vaults</h1>
        <p className="text-slate-600 mb-6">Explore example vaults to try features and clone templates into your account.</p>

        <section className="grid gap-4 sm:grid-cols-3">
          {demos.map((d) => (
            <div key={d.id} className="p-4 rounded-lg border flex flex-col justify-between">
              <div>
                <h3 className="font-semibold">{d.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{d.desc}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <a href={`/demos/${d.id}`} className="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Open Demo</a>
                <button className="text-sm px-3 py-1 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50">Clone to account</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}