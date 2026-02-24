import { X, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface CampaignIdModalProps {
  campaignId: string;
  campaignName: string;
  onClose: () => void;
}

export function CampaignIdModal({ campaignId, campaignName, onClose }: CampaignIdModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(campaignId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-md w-full shadow-2xl transform transition-all"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between border-b-2 border-[#DCC8A8]">
          <div>
            <h2 className="text-xl font-extrabold text-[#3D1409] mb-1" style={{ fontFamily: 'var(--font-archivo-black)' }}>
              Campaign Created!
            </h2>
            <p className="text-[#5C4A2F] text-sm">{campaignName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-white/50 border-2 border-[#8B6F47] rounded-xl p-4">
            <p className="text-[#3D1409] font-semibold mb-2 text-sm">Campaign ID</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-[#8B6F47] rounded-lg px-4 py-3 font-mono text-2xl tracking-widest text-[#3D1409] text-center font-bold">
                {campaignId}
              </div>
              <button
                onClick={handleCopy}
                className="p-3 bg-[#5C1A1A] hover:bg-[#3D1409] text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="bg-[#5C1A1A]/5 border-2 border-[#5C1A1A]/20 rounded-xl p-4">
            <p className="text-sm text-[#3D1409] leading-relaxed">
              <span className="font-semibold">Share this ID with your players!</span> They'll need it to join your campaign. 
              Make sure to also share the campaign password with them.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-4 border-[#3D1409]"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
