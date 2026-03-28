"use client";

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TutorialStep {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom';
}

const STEPS: TutorialStep[] = [
  {
    selector: '[data-tutorial="role-tabs"]',
    title: 'Switch Roles',
    description: 'Toggle between Player and Game Master. Each role shows different vaults and actions.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="action-button"]',
    title: 'Create or Join',
    description: 'As a Game Master, create new vaults here. As a Player, join existing ones with an invite code.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="vault-list"]',
    title: 'Your Vaults',
    description: 'All your campaign vaults appear here. Click any vault card to open it and manage inventory.',
    position: 'top',
  },
];

export function VaultsTutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom'>('top');

  const step = STEPS[currentStep];

  const positionPopup = useCallback(() => {
    const el = document.querySelector(step.selector);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const gap = 12;
    const popupWidth = Math.min(320, window.innerWidth - 32);

    // Center popup horizontally relative to target
    let left = rect.left + rect.width / 2 - popupWidth / 2;
    // Keep within viewport
    left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));

    if (step.position === 'bottom') {
      setPopupStyle({
        position: 'fixed',
        top: rect.bottom + gap,
        left,
        width: popupWidth,
        zIndex: 60,
      });
      setArrowPosition('top');
      setArrowStyle({
        position: 'absolute',
        top: -8,
        left: Math.max(16, rect.left + rect.width / 2 - left - 6),
      });
    } else {
      setPopupStyle({
        position: 'fixed',
        top: rect.top - gap,
        left,
        width: popupWidth,
        zIndex: 60,
        transform: 'translateY(-100%)',
      });
      setArrowPosition('bottom');
      setArrowStyle({
        position: 'absolute',
        bottom: -8,
        left: Math.max(16, rect.left + rect.width / 2 - left - 6),
      });
    }
  }, [step]);

  useEffect(() => {
    positionPopup();
    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, true);
    return () => {
      window.removeEventListener('resize', positionPopup);
      window.removeEventListener('scroll', positionPopup, true);
    };
  }, [positionPopup]);

  // Highlight the target element
  useEffect(() => {
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) return;

    el.style.position = 'relative';
    el.style.zIndex = '55';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    return () => {
      el.style.position = '';
      el.style.zIndex = '';
    };
  }, [step.selector]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onComplete} />

      {/* Popup tooltip */}
      <div style={popupStyle}>
        {/* Arrow */}
        <div style={{ ...arrowStyle, zIndex: 3 }}>
          <div
            className={`w-4 h-4 bg-[#3D1409] rotate-45 border-[#8B6F47] ${arrowPosition === 'top' ? 'border-l-2 border-t-2' : 'border-r-2 border-b-2'}`}
          />
        </div>

        <div className="bg-[#3D1409] rounded-xl shadow-2xl border-2 border-[#8B6F47] overflow-hidden relative z-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8A97A]" />
              <span className="text-xs font-bold text-[#C8A97A] uppercase tracking-wider">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>
            <button
              onClick={onComplete}
              className="text-[#F5EDE0]/50 hover:text-[#F5EDE0] transition-colors p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-2">
            <h3 className="text-[#F5EDE0] font-bold text-base mb-1">{step.title}</h3>
            <p className="text-[#F5EDE0]/70 text-sm leading-relaxed">{step.description}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-black/20">
            <button
              onClick={onComplete}
              className="text-xs text-[#F5EDE0]/50 hover:text-[#F5EDE0] transition-colors"
            >
              Skip tutorial
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#F5EDE0]/70 hover:text-[#F5EDE0] transition-colors rounded-lg"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-1 px-4 py-1.5 bg-[#8B6F47] hover:bg-[#A0845A] text-white text-xs font-bold rounded-lg transition-colors"
              >
                {currentStep < STEPS.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  'Done'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
