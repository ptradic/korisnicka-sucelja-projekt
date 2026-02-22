import { Wand2, Scroll, FileText, ShoppingBag, Search, Filter, Eye, Download, Sparkles } from 'lucide-react';

const tools = [
  { href: "/dm-tools/loot-generator", title: "Loot Generator", desc: "Generate random treasure by CR, rarity or table.", icon: Wand2 },
  { href: "/dm-tools/random-table", title: "Random Tables", desc: "Customizable tables for encounters, loot and events.", icon: Scroll },
  { href: "/dm-tools/session-notes", title: "Session Notes", desc: "Quick session notes with export to PDF/JSON.", icon: FileText },
  { href: "/dm-tools/merchant-pricing", title: "Merchant Pricing", desc: "Bulk price editor and inventory value calculator.", icon: ShoppingBag },
];

const sampleItems = [
  { id: "sword-01", name: "Longsword", type: "Weapon", rarity: "Common", weight: "3 lb" },
  { id: "potion-01", name: "Healing Potion", type: "Consumable", rarity: "Uncommon", weight: "0.5 lb" },
  { id: "cloak-01", name: "Cloak of Elvenkind", type: "Armor", rarity: "Rare", weight: "1 lb" },
];

export const dynamic = 'force-static';

export default function DMToolsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-10 bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
            <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Dungeon Master Utilities
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            DM Tools
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5C4A2F] leading-relaxed">
            Lightweight utilities to help Game Masters manage loot, shops and sessions with ease.
          </p>
        </div>

        {/* Tools Grid */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#3D1409]">Quick Tools</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {tools.map((t) => {
              const Icon = t.icon;
              return (
                <a key={t.href} href={t.href} className="group block">
                  <div className="h-full p-6 rounded-2xl bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform duration-300 shadow-md">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors mb-2">
                          {t.title}
                        </h3>
                        <p className="text-sm text-[#5C4A2F] leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Vault Library Section */}
        <section className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1409]">Vault Library</h2>
          </div>
          
          <p className="text-[#5C4A2F] mb-6 text-base leading-relaxed">
            Shared item templates and community catalog — import items into your vaults.
          </p>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B6F47]" />
                <input
                  aria-label="Search library"
                  className="w-full pl-11 pr-4 py-3 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                  placeholder="Search items, types or rarity..."
                  readOnly
                />
              </div>
              <button
                aria-label="Open filters"
                className="group px-6 py-3 rounded-xl bg-[#F5EFE0] hover:bg-white text-[#5C1A1A] font-bold border-4 border-[#8B6F47] hover:border-[#5C1A1A] shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {sampleItems.map((item) => (
              <div key={item.id} className="bg-white/60 border-3 border-[#DCC8A8] rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-[#3D1409] mb-2">{item.name}</h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-[#8B6F47]/20 text-[#5C4A2F] rounded-md font-medium">{item.type}</span>
                    <span className="px-2 py-1 bg-[#5C1A1A]/20 text-[#5C1A1A] rounded-md font-medium">{item.rarity}</span>
                    <span className="px-2 py-1 bg-[#DCC8A8] text-[#5C4A2F] rounded-md font-medium">{item.weight}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="group flex-1 px-4 py-2 rounded-lg bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-[#3D1409]">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="group flex-1 px-4 py-2 rounded-lg bg-[#F5EFE0] hover:bg-white text-[#5C1A1A] font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-[#8B6F47] hover:border-[#5C1A1A]">
                    <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
                    Import
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="bg-linear-to-br from-[#5C1A1A]/10 to-transparent border-3 border-[#8B6F47] rounded-xl p-5">
            <p className="text-sm text-[#5C4A2F] leading-relaxed">
              <strong className="text-[#3D1409]">Want to add your own templates?</strong> Provide a JSON/CSV import in the Vault settings or contribute to the community library.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
