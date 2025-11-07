import { Navigation } from "@components/navigation";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <Navigation />
      <div className="max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Trailblazers' Vault</h1>
        <p className="text-xl text-slate-600 mb-6">“Your party’s loot, safely stashed.”</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">About the project</h2>
          <p className="text-slate-700">
            Trailblazers’ Vault solves the clutter and confusion that often comes with managing items and loot
            in tabletop RPGs like D&amp;D. It helps players and game masters organize shared inventories across
            multiple players and campaigns with a simple, interactive drag-and-drop interface.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">What it does</h2>
          <ul className="list-disc list-inside text-slate-700 space-y-1">
            <li>Streamlined party and campaign inventory management</li>
            <li>Drag-and-drop item organization and sorting</li>
            <li>Shared vaults so players and GMs stay in sync</li>
            <li>Import/export and template item library</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Quick links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <a href="/guides" className="block p-4 rounded-lg border hover:shadow">
              <h3 className="font-semibold">Guides & Tutorials</h3>
              <p className="text-sm text-slate-600">Onboarding, drag-and-drop walkthroughs, and usage tips.</p>
            </a>
            <a href="/demos" className="block p-4 rounded-lg border hover:shadow">
              <h3 className="font-semibold">Demos</h3>
              <p className="text-sm text-slate-600">Explore example vaults and interactive demo data.</p>
            </a>
            <a href="/library" className="block p-4 rounded-lg border hover:shadow">
              <h3 className="font-semibold">Library</h3>
              <p className="text-sm text-slate-600">Shared item templates and community catalog.</p>
            </a>
            <a href="/support" className="block p-4 rounded-lg border hover:shadow">
              <h3 className="font-semibold">Support</h3>
              <p className="text-sm text-slate-600">Report bugs, request features, or find help.</p>
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">Why we built it</h2>
          <p className="text-slate-700">
            Born from experience at the table, we wanted a simple, reliable way to track and share gear so the game
            stays focused on play instead of spreadsheet management.
          </p>
        </section>
      </div>
    </main>
  );
}

