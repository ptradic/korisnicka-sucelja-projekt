import { Navigation } from "@components/navigation";

export default function SupportPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-10">
      <Navigation />
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-extrabold mb-4">Support & Feedback</h1>
        <p className="text-slate-600 mb-6">Report bugs, request features or find quick help resources.</p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Quick links</h2>
          <ul className="list-disc list-inside text-slate-700">
            <li><a href="https://github.com/your-repo" className="text-indigo-600">Open an issue on GitHub</a></li>
            <li><a href="/faq" className="text-indigo-600">FAQ & Troubleshooting</a></li>
            <li><a href="#" className="text-indigo-600">Community Discord / Chat</a></li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Send feedback</h2>
          <form className="space-y-3">
            <div>
              <label className="text-sm block mb-1">Subject</label>
              <input className="w-full border rounded p-2" placeholder="Short summary" />
            </div>
            <div>
              <label className="text-sm block mb-1">Details</label>
              <textarea className="w-full border rounded p-2" rows={5} placeholder="Describe the bug or feature request" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">Send</button>
              <button type="reset" className="px-4 py-2 rounded border">Reset</button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}