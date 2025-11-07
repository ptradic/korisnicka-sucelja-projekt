import { Navigation } from "@components/navigation";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <Navigation />

      <section className="w-full max-w-5xl text-center mb-12">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Trailblazers' Vault</h1>
        <p className="text-xl text-slate-600 mb-6">“Your party’s loot, safely stashed.”</p>

        <p className="max-w-3xl mx-auto text-slate-700 mb-6">
          Organize shared inventories for tabletop RPGs with a simple drag-and-drop interface,
          customizable item templates, and tools built for players and Game Masters.
        </p>

        <div className="flex justify-center gap-3 mb-8">
          <a
            href="/demos"
            className="px-5 py-3 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Try a demo
          </a>
          <a
            href="/guides/quick-start"
            className="px-5 py-3 rounded border border-indigo-600 text-indigo-600 text-sm font-medium hover:bg-indigo-50"
          >
            Quick start
          </a>
          <a
            href="/library"
            className="px-5 py-3 rounded border text-sm font-medium hover:bg-slate-50"
          >
            Browse library
          </a>
        </div>
      </section>

      <section className="w-full max-w-5xl grid gap-6 sm:grid-cols-3 mb-12">
        <div className="p-6 rounded-lg border">
          <h3 className="font-semibold mb-2">Shared Vaults</h3>
          <p className="text-sm text-slate-600">Keep party inventories synchronized across players and campaigns.</p>
        </div>

        <div className="p-6 rounded-lg border">
          <h3 className="font-semibold mb-2">Drag & Drop</h3>
          <p className="text-sm text-slate-600">Move, stack and sort items quickly with an intuitive interface.</p>
        </div>

        <div className="p-6 rounded-lg border">
          <h3 className="font-semibold mb-2">Library & Templates</h3>
          <p className="text-sm text-slate-600">Import community templates or save your own item presets.</p>
        </div>
      </section>

      <section className="w-full max-w-5xl mb-12">
        <h2 className="text-2xl font-semibold mb-4">Get started</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <a href="/guides/quick-start" className="p-4 rounded-lg border hover:shadow">
            <h4 className="font-semibold">Create a campaign</h4>
            <p className="text-sm text-slate-600">Set up players, vaults and permissions in minutes.</p>
          </a>

          <a href="/demos/party-vault" className="p-4 rounded-lg border hover:shadow">
            <h4 className="font-semibold">Explore a demo vault</h4>
            <p className="text-sm text-slate-600">Open an example party vault to see features in action.</p>
          </a>

          <a href="/library" className="p-4 rounded-lg border hover:shadow">
            <h4 className="font-semibold">Import item templates</h4>
            <p className="text-sm text-slate-600">Browse the Vault Library and import templates into your campaigns.</p>
          </a>
        </div>
      </section>

      <footer className="w-full max-w-5xl text-sm text-slate-500">
        <p>Born from play — designed to keep your sessions flowing. • <a href="/about" className="text-indigo-600">About</a></p>
      </footer>
    </main>
  );
}