import { BookOpen, Rocket, MousePointer, Upload, Users, FileText, Lightbulb, ChevronRight } from 'lucide-react';

const guides = [
  { 
    href: "/quick-start", 
    title: "Quick Start", 
    desc: "Create a campaign, add players, add items and share the vault.", 
    icon: Rocket,
    difficulty: "Beginner"
  },
  { 
    href: "/guides/drag-drop", 
    title: "Drag & Drop", 
    desc: "Walkthrough of moving items, stacking and sorting within vaults.", 
    icon: MousePointer,
    difficulty: "Beginner"
  },
  { 
    href: "/guides/import-export", 
    title: "Import & Export", 
    desc: "How to import templates and export vault data (CSV / JSON).", 
    icon: Upload,
    difficulty: "Intermediate"
  },
  { 
    href: "/guides/shared-vaults", 
    title: "Shared Vaults", 
    desc: "Sharing settings, permissions, and syncing between players.", 
    icon: Users,
    difficulty: "Intermediate"
  },
];

export const dynamic = 'force-static';

export default function GuidesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-10 bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
            <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learn How to Use the Vault
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>
            Guides & Tutorials
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5C4A2F] leading-relaxed">
            Step-by-step walkthroughs to get started with Trailblazers' Vault and master all features.
          </p>
        </div>

        {/* Guides Grid */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#3D1409]">Available Guides</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {guides.map((guide) => {
              const Icon = guide.icon;
              return (
                <a key={guide.href} href={guide.href} className="group block">
                  <div className="h-full p-6 rounded-2xl bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform duration-300 shadow-md">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-bold text-lg text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors">
                            {guide.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap ${
                            guide.difficulty === 'Beginner' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {guide.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-[#5C4A2F] leading-relaxed">{guide.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[#5C1A1A] font-semibold text-sm group-hover:gap-3 transition-all duration-300">
                      <span>Open guide</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Additional Resources */}
        <section className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-linear-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1409]">Additional Resources</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mb-6">
            <div className="bg-white/60 border-3 border-[#DCC8A8] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="w-6 h-6 text-[#5C1A1A] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-[#3D1409] mb-2">Documentation</h3>
                  <p className="text-sm text-[#5C4A2F] leading-relaxed mb-4">
                    Complete API documentation and technical references for advanced users.
                  </p>
                  <a href="/docs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5C1A1A] hover:gap-3 transition-all duration-300">
                    View docs <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white/60 border-3 border-[#DCC8A8] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Users className="w-6 h-6 text-[#5C1A1A] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-[#3D1409] mb-2">Community</h3>
                  <p className="text-sm text-[#5C4A2F] leading-relaxed mb-4">
                    Join our community for tips, templates, and support from other users.
                  </p>
                  <a href="/community" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5C1A1A] hover:gap-3 transition-all duration-300">
                    Join community <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-[#5C1A1A]/10 to-transparent border-3 border-[#8B6F47] rounded-xl p-5">
            <p className="text-sm text-[#5C4A2F] leading-relaxed">
              <strong className="text-[#3D1409]">Need more help?</strong> Visit our <a href="/support" className="text-[#5C1A1A] font-semibold hover:underline">Support page</a> to report issues or request new features.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
