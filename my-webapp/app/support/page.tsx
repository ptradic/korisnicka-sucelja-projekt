import { LifeBuoy, Github, MessageCircle, HelpCircle, Send, RotateCcw, Mail, ExternalLink, Bug, Lightbulb } from 'lucide-react';

const quickLinks = [
  {
    href: "https://github.com/your-repo",
    title: "GitHub Issues",
    desc: "Report bugs or request features",
    icon: Github,
    external: true
  },
  {
    href: "/faq",
    title: "FAQ & Troubleshooting",
    desc: "Common questions and solutions",
    icon: HelpCircle,
    external: false
  },
  {
    href: "#",
    title: "Community Discord",
    desc: "Chat with other users",
    icon: MessageCircle,
    external: true
  },
];

export const dynamic = 'force-static';

export default function SupportPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-10 bg-gradient-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-2 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
            <span className="text-sm font-semibold text-[#5C1A1A] flex items-center gap-2">
              <LifeBuoy className="w-4 h-4" />
              We're Here to Help
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-[#3D1409]">
            Support & Feedback
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#5C4A2F] leading-relaxed">
            Report bugs, request features, or find quick help resources to get the most out of Trailblazers' Vault.
          </p>
        </div>

        {/* Quick Links Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#3D1409]">Quick Links</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a 
                  key={link.href} 
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="group block"
                >
                  <div className="h-full p-6 rounded-2xl bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300 shadow-md">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-[#3D1409] group-hover:text-[#5C1A1A] transition-colors mb-2 flex items-center gap-2">
                        {link.title}
                        {link.external && <ExternalLink className="w-4 h-4" />}
                      </h3>
                      <p className="text-sm text-[#5C4A2F] leading-relaxed">
                        {link.desc}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Feedback Form Section */}
        <section className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-6 sm:p-10 shadow-2xl mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] rounded-xl flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1409]">Send Feedback</h2>
          </div>

          <p className="text-[#5C4A2F] mb-6">
            Have a bug to report or a feature idea? Let us know below and we'll get back to you.
          </p>

          <form className="space-y-6">
            <div>
              <label className="block mb-2 text-[#3D1409] font-semibold">
                Feedback Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-4 rounded-xl border-3 border-[#8B6F47] bg-white/50 cursor-pointer hover:bg-white hover:border-[#5C1A1A] transition-all duration-300">
                  <input type="radio" name="type" value="bug" className="w-4 h-4 text-[#5C1A1A]" />
                  <Bug className="w-5 h-5 text-[#5C1A1A]" />
                  <span className="text-[#3D1409] font-medium">Bug Report</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border-3 border-[#8B6F47] bg-white/50 cursor-pointer hover:bg-white hover:border-[#5C1A1A] transition-all duration-300">
                  <input type="radio" name="type" value="feature" className="w-4 h-4 text-[#5C1A1A]" />
                  <Lightbulb className="w-5 h-5 text-[#5C1A1A]" />
                  <span className="text-[#3D1409] font-medium">Feature Request</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-[#3D1409] font-semibold">
                Subject
              </label>
              <input 
                className="w-full px-4 py-3 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300" 
                placeholder="Brief summary of your feedback" 
              />
            </div>

            <div>
              <label className="block mb-2 text-[#3D1409] font-semibold">
                Details
              </label>
              <textarea 
                className="w-full px-4 py-3 border-3 border-[#8B6F47] rounded-xl bg-white/70 text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300" 
                rows={6} 
                placeholder="Describe the bug or feature request in detail. Include steps to reproduce if reporting a bug."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="submit" 
                className="group flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border-4 border-[#3D1409]"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                Send Feedback
              </button>
              <button 
                type="reset" 
                className="group px-6 py-3 rounded-xl bg-[#F5EFE0] hover:bg-white text-[#5C1A1A] font-bold shadow-md hover:shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 border-4 border-[#8B6F47] hover:border-[#5C1A1A]"
              >
                <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                Reset Form
              </button>
            </div>
          </form>
        </section>

        {/* Additional Help */}
        <section className="bg-gradient-to-br from-[#5C1A1A]/10 to-transparent border-4 border-[#8B6F47] rounded-2xl p-6 sm:p-8">
          <h3 className="text-2xl font-bold mb-4 text-[#3D1409]">Need Immediate Help?</h3>
          <p className="text-[#5C4A2F] leading-relaxed mb-4">
            Check out our <a href="/guides" className="text-[#5C1A1A] font-semibold hover:underline">Guides & Tutorials</a> for step-by-step walkthroughs, or visit the <a href="/faq" className="text-[#5C1A1A] font-semibold hover:underline">FAQ</a> for answers to common questions.
          </p>
          <p className="text-sm text-[#5C4A2F]">
            Most issues can be resolved quickly by checking our documentation first.
          </p>
        </section>
      </div>
    </main>
  );
}