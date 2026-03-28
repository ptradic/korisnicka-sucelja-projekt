"use client";

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface TutorialStep {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const GM_STEPS: TutorialStep[] = [
  {
    selector: '[data-tutorial="sidebar"]',
    title: 'Party Sidebar',
    description: 'View all party members here. Click a player to see their inventory, or select Shared Loot for items the whole party can access.',
    position: 'right',
  },
  {
    selector: '[data-tutorial="shared-loot"]',
    title: 'Shared Loot',
    description: 'Items dropped here are visible to all players. Great for undistributed treasure or party supplies.',
    position: 'right',
  },
  {
    selector: '[data-tutorial="coins-row"]',
    title: 'Currency Tracking',
    description: 'Track coins for each player. Click any coin value to edit it directly.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="weight-bar"]',
    title: 'Carry Capacity',
    description: 'Shows how much weight a character is carrying. Click the weight limit to adjust it based on Strength score or a custom value.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="search-toolbar"]',
    title: 'Search & Filter',
    description: 'Search items by name, filter by category, sort by different properties, or bulk-select items for moving.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="item-list"]',
    title: 'Item List',
    description: 'All inventory items appear here. Click any item to view details and edit. Drag items to a player in the sidebar to transfer them.',
    position: 'top',
  },
  {
    selector: '[data-tutorial="add-item"]',
    title: 'Add Items',
    description: 'Add items from the official 5e/5.5e catalog or create custom homebrew items for your campaign.',
    position: 'top',
  },
  {
    selector: '[data-tutorial="vault-settings"]',
    title: 'Vault Settings',
    description: 'Manage your vault name, password, and copy the invite code to share with players.',
    position: 'bottom',
  },
];

const PLAYER_STEPS: TutorialStep[] = [
  {
    selector: '[data-tutorial="sidebar"]',
    title: 'Party Sidebar',
    description: 'See your party members here. Click your name to view your inventory, or Shared Loot for party items.',
    position: 'right',
  },
  {
    selector: '[data-tutorial="shared-loot"]',
    title: 'Shared Loot',
    description: 'Party items that haven\'t been claimed yet. Drag items here to share them, or take items from here.',
    position: 'right',
  },
  {
    selector: '[data-tutorial="coins-row"]',
    title: 'Your Coins',
    description: 'Track your character\'s coins. Click any value to edit it. When viewing Shared Loot, you can deposit or withdraw coins.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="weight-bar"]',
    title: 'Carry Capacity',
    description: 'Keep an eye on your weight limit. Click it to set your carry capacity based on Strength or a custom value.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="search-toolbar"]',
    title: 'Search & Filter',
    description: 'Quickly find items by name, filter by category, or sort your inventory.',
    position: 'bottom',
  },
  {
    selector: '[data-tutorial="item-list"]',
    title: 'Your Items',
    description: 'Your inventory items. Click to view details. Drag items to another player to send a transfer request, or to Shared Loot to share.',
    position: 'top',
  },
  {
    selector: '[data-tutorial="add-item"]',
    title: 'Add Items',
    description: 'Add items from the 5e/5.5e catalog or pick from the vault\'s custom item pool.',
    position: 'top',
  },
  {
    selector: '[data-tutorial="character-settings"]',
    title: 'Character Name',
    description: 'Click here to change your character name in this vault.',
    position: 'bottom',
  },
];

const STORAGE_KEY = 'vault-tutorial-seen';

export function useVaultTutorial(isGM: boolean) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    try {
      const key = `${STORAGE_KEY}-${isGM ? 'gm' : 'player'}`;
      if (!localStorage.getItem(key)) {
        // Small delay to let the page render first
        const timer = setTimeout(() => setShowTutorial(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore storage errors
    }
  }, [isGM]);

  const startTutorial = () => setShowTutorial(true);

  const completeTutorial = () => {
    setShowTutorial(false);
    try {
      const key = `${STORAGE_KEY}-${isGM ? 'gm' : 'player'}`;
      localStorage.setItem(key, '1');
    } catch {
      // Ignore storage errors
    }
  };

  return { showTutorial, startTutorial, completeTutorial };
}

// Find the first visible element matching a selector
function queryVisible(selector: string): Element | null {
  const all = document.querySelectorAll(selector);
  for (const el of all) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

export function VaultTutorial({ isGM, onComplete }: { isGM: boolean; onComplete: () => void }) {
  const steps = isGM ? GM_STEPS : PLAYER_STEPS;
  const [currentStep, setCurrentStep] = useState(0);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [arrowDirection, setArrowDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const [visible, setVisible] = useState(false);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];

  const positionPopup = useCallback(() => {
    const el = queryVisible(step.selector);
    if (!el) {
      setVisible(false);
      return;
    }

    const rect = el.getBoundingClientRect();
    setHighlightRect(rect);
    const gap = 14;
    const mobile = window.innerWidth < 640;
    const popupWidth = Math.min(mobile ? 280 : 300, window.innerWidth - 32);
    const popupEstimatedHeight = 160;

    let top = 0;
    let left = 0;
    let arrowTop = 0;
    let arrowLeft = 0;
    // On mobile, force left/right positions to bottom since there's no side space
    let direction = (mobile && (step.position === 'left' || step.position === 'right')) ? 'bottom' as const : step.position;

    if (direction === 'bottom') {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - popupWidth / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));
      arrowLeft = Math.max(16, rect.left + rect.width / 2 - left - 6);
      arrowTop = -8;
      // Flip to top if popup would go off-screen
      if (top + popupEstimatedHeight > window.innerHeight - 16) {
        direction = 'top';
        top = rect.top - gap - popupEstimatedHeight;
        arrowTop = popupEstimatedHeight - 1;
      }
    } else if (direction === 'top') {
      top = rect.top - gap - popupEstimatedHeight;
      left = rect.left + rect.width / 2 - popupWidth / 2;
      left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));
      arrowLeft = Math.max(16, rect.left + rect.width / 2 - left - 6);
      arrowTop = popupEstimatedHeight - 1;
    } else if (direction === 'right') {
      top = rect.top + rect.height / 2 - popupEstimatedHeight / 2;
      left = rect.right + gap;
      // If not enough space on right, flip to bottom
      if (left + popupWidth > window.innerWidth - 16) {
        direction = 'bottom';
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - popupWidth / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));
        arrowLeft = Math.max(16, rect.left + rect.width / 2 - left - 6);
        arrowTop = -8;
      } else {
        arrowLeft = -8;
        arrowTop = popupEstimatedHeight / 2 - 6;
      }
    } else if (direction === 'left') {
      top = rect.top + rect.height / 2 - popupEstimatedHeight / 2;
      left = rect.left - gap - popupWidth;
      arrowLeft = popupWidth - 1;
      arrowTop = popupEstimatedHeight / 2 - 6;
    }

    // Keep within viewport vertically
    top = Math.max(16, Math.min(top, window.innerHeight - popupEstimatedHeight - 16));

    setPopupStyle({
      position: 'fixed',
      top,
      left,
      width: popupWidth,
      zIndex: 60,
    });

    setArrowDirection(direction);

    const arrowPos: React.CSSProperties = { position: 'absolute' };
    if (direction === 'top') {
      arrowPos.bottom = -8;
      arrowPos.left = arrowLeft;
    } else if (direction === 'bottom') {
      arrowPos.top = -8;
      arrowPos.left = arrowLeft;
    } else if (direction === 'right') {
      arrowPos.left = -8;
      arrowPos.top = arrowTop;
    } else if (direction === 'left') {
      arrowPos.right = -8;
      arrowPos.top = arrowTop;
    }
    setArrowStyle(arrowPos);
    setVisible(true);
  }, [step, currentStep, steps.length, onComplete]);

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(positionPopup, 50);
    window.addEventListener('resize', positionPopup);
    window.addEventListener('scroll', positionPopup, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', positionPopup);
      window.removeEventListener('scroll', positionPopup, true);
    };
  }, [positionPopup]);


  const handleNext = () => {
    // Find next step with a visible element
    for (let i = currentStep + 1; i < steps.length; i++) {
      if (queryVisible(steps[i].selector)) {
        setCurrentStep(i);
        return;
      }
    }
    onComplete();
  };

  const handlePrev = () => {
    // Find previous step with a visible element
    for (let i = currentStep - 1; i >= 0; i--) {
      if (queryVisible(steps[i].selector)) {
        setCurrentStep(i);
        return;
      }
    }
  };

  const arrowBorderClass = (() => {
    switch (arrowDirection) {
      case 'top': return 'border-l-2 border-t-2';
      case 'bottom': return 'border-r-2 border-b-2';
      case 'left': return 'border-t-2 border-r-2';
      case 'right': return 'border-b-2 border-l-2';
    }
  })();

  // Count visible steps and current position among them
  const visibleStepIndices = steps.reduce<number[]>((acc, s, i) => {
    if (queryVisible(s.selector)) acc.push(i);
    return acc;
  }, []);
  const visiblePosition = visibleStepIndices.indexOf(currentStep) + 1;
  const visibleTotal = visibleStepIndices.length;

  if (!visible) return null;

  return (
    <>
      {/* Cutout overlay — uses a huge box-shadow to darken everything except the target */}
      <div
        className="fixed z-50 rounded-lg pointer-events-none"
        style={highlightRect ? {
          top: highlightRect.top - 4,
          left: highlightRect.left - 4,
          width: highlightRect.width + 8,
          height: highlightRect.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
          border: '2px solid rgba(200, 169, 122, 0.5)',
        } : { top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)' }}
      />
      {/* Clickable overlay behind the cutout to handle dismiss */}
      <div className="fixed inset-0 z-49" onClick={onComplete} />

      {/* Popup tooltip */}
      <div style={popupStyle}>
        {/* Arrow */}
        <div style={{ ...arrowStyle, zIndex: 3 }}>
          <div className={`w-4 h-4 bg-[#3D1409] rotate-45 border-[#8B6F47] ${arrowBorderClass}`} />
        </div>

        <div className="bg-[#3D1409] rounded-xl shadow-2xl border-2 border-[#8B6F47] overflow-hidden relative z-2">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8A97A]" />
              <span className="text-xs font-bold text-[#C8A97A] uppercase tracking-wider">
                Step {visiblePosition} of {visibleTotal}
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
                {visiblePosition < visibleTotal ? (
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
