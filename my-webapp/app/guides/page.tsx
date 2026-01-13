export default function GuidesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-extrabold mb-4">Guides & Tutorials</h1>
        <p className="text-slate-600 mb-6">Step-by-step walkthroughs to get started with Trailblazers' Vault.</p>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="p-4 rounded-lg border">
            <h3 className="font-semibold">Quick Start</h3>
            <p className="text-sm text-slate-600">Create a campaign, add players, add items and share the vault.</p>
            <a href="/quick-start" className="text-sm text-indigo-600 mt-2 block">Open guide →</a>
          </article>

          <article className="p-4 rounded-lg border">
            <h3 className="font-semibold">Drag & Drop</h3>
            <p className="text-sm text-slate-600">Walkthrough of moving items, stacking and sorting within vaults.</p>
            <a href="/guides/drag-drop" className="text-sm text-indigo-600 mt-2 block">Open guide →</a>
          </article>

          <article className="p-4 rounded-lg border">
            <h3 className="font-semibold">Import & Export</h3>
            <p className="text-sm text-slate-600">How to import templates and export vault data (CSV / JSON).</p>
            <a href="/guides/import-export" className="text-sm text-indigo-600 mt-2 block">Open guide →</a>
          </article>

          <article className="p-4 rounded-lg border">
            <h3 className="font-semibold">Shared Vaults</h3>
            <p className="text-sm text-slate-600">Sharing settings, permissions, and syncing between players.</p>
            <a href="/guides/shared-vaults" className="text-sm text-indigo-600 mt-2 block">Open guide →</a>
          </article>
        </section>
      </div>
    </main>
  );
}