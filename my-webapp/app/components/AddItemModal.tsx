import { useState, useRef, useEffect } from 'react';
import { X, Search, Plus, Package, Loader2, Check } from 'lucide-react';
import type { Item, Category, Rarity } from '../types';
import { ItemDetailsModal } from './ItemDetailsModal';
import { useCustomScrollbar } from '../hooks/useCustomScrollbar';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
  targetName: string;
  isDM?: boolean;
  customItems?: Item[];
  userHomebrew?: Item[];
  customItemPool?: Item[];
  onSaveCustomItemPool?: (items: Item[]) => Promise<void> | void;
  onCreateHomebrew?: (item: Omit<Item, 'id'>) => Promise<void> | void;
  onUpdateHomebrewItem?: (item: Item) => Promise<void> | void;
  onDeleteHomebrewItem?: (itemId: string) => Promise<void> | void;
}

interface DnDItemListItem {
  index: string;
  name: string;
  type: 'equipment' | 'magic';
  rarity?: string;
  editionKey?: string;
}

const categories: Category[] = ['weapons', 'armor', 'consumables', 'magic-gear', 'adventuring-gear', 'wealth-valuables'];
const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];

const formatCategoryLabel = (category: string) => {
  if (category === 'wealth-valuables') return 'Wealth & Valuables';
  return category
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const rarityColors: Record<string, string> = {
  common: 'text-[#5C4A2F]',
  uncommon: 'text-[#3D5A27]',
  rare: 'text-[#2C4A7C]',
  'very rare': 'text-[#5E3A7C]',
  legendary: 'text-[#8B6914]',
  artifact: 'text-[#6B2020]',
};

const rarityDots: Record<string, string> = {
  common: 'bg-[#A89A7C]',
  uncommon: 'bg-[#5C7A3B]',
  rare: 'bg-[#4A6FA5]',
  'very rare': 'bg-[#7E57A2]',
  legendary: 'bg-[#B8860B]',
  artifact: 'bg-[#8B3A3A]',
};

const dndRarityDotByKey: Record<string, string> = {
  common: rarityDots.common,
  uncommon: rarityDots.uncommon,
  rare: rarityDots.rare,
  'very-rare': rarityDots['very rare'],
  legendary: rarityDots.legendary,
  artifact: rarityDots.artifact,
  varies: rarityDots.common,
  none: 'bg-[#8B6F47]/50',
};

const dndRarityLabelByKey: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  'very-rare': 'Very Rare',
  legendary: 'Legendary',
  artifact: 'Artifact',
  varies: 'Varies',
  none: 'Mundane',
};

function TemplateItemPicker({
  customItems,
  onSelect,
  onClose,
  targetName,
}: {
  customItems: Item[];
  onSelect: (item: Item) => void;
  onClose: () => void;
  targetName: string;
}) {
  const [search, setSearch] = useState('');
  const [dndItems, setDndItems] = useState<DnDItemListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [tab, setTab] = useState<'dnd' | 'custom'>('dnd');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const {
    showScrollbar,
    thumbTop,
    thumbHeight,
    trackRef,
    handleTrackClick,
    handleThumbMouseDown,
  } = useCustomScrollbar(listRef);

  // Fetch 5e or 5.5e items from API
  useEffect(() => {
    if (tab !== 'dnd') return;

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (search.length < 2) {
        setDndItems([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/dnd-items?search=${encodeURIComponent(search)}`);
        if (response.ok) {
          const items = await response.json();
          setDndItems(items);
        }
      } catch (error) {
        console.error('Failed to fetch 5e or 5.5e items:', error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, tab]);

  // Handle selecting a 5e or 5.5e item (fetch full details)
  const handleSelectDndItem = async (dndItem: DnDItemListItem) => {
    setLoadingDetails(dndItem.index);
    try {
      const response = await fetch(`/api/dnd-items?index=${encodeURIComponent(dndItem.index)}`);
      if (response.ok) {
        const itemDetails = await response.json();
        onSelect({
          id: `dnd-${dndItem.index}`,
          ...itemDetails,
        });
      }
    } catch (error) {
      console.error('Failed to fetch item details:', error);
      alert('Failed to load item details. Please try again.');
    } finally {
      setLoadingDetails(null);
    }
  };

  const filteredCustomItems = customItems.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });


  return (
    <>
      <div className="sticky top-0 bg-[#F5EFE0] p-4 sm:p-5 pb-3 flex items-start justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#3D1409]">Add Item to {targetName}</h2>
            <p className="text-[#5C4A2F] text-xs mt-0.5">
              {tab === 'dnd' ? 'Search 5e or 5.5e items' : 'Choose from custom items'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost active:scale-100 !p-1.5 text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-[#8B6F47]/30 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C4A2F]" />
          <input
            type="text"
            placeholder={tab === 'dnd' ? "Search 5e or 5.5e items (e.g., 'sword', 'potion')..." : 'Search custom items...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border-2 border-[#8B6F47]/60 rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F]"
          />
          {loading && tab === 'dnd' && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C4A2F] animate-spin" />
          )}
        </div>

        {/* Toggle between 5e or 5.5e API and custom items */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab('dnd')}
            className={
              'flex-1 text-xs rounded-lg ' +
              (tab === 'dnd'
                ? 'btn-primary !px-3 !py-1.5'
                : 'btn-secondary !px-3 !py-1.5 text-[#5C4A2F] border-[#8B6F47]/40 hover:bg-[#F0E8D5]')
            }
          >
            5e or 5.5e Items
          </button>
          <button
            onClick={() => setTab('custom')}
            className={
              'flex-1 text-xs rounded-lg ' +
              (tab === 'custom'
                ? 'btn-primary !px-3 !py-1.5'
                : 'btn-secondary !px-3 !py-1.5 text-[#5C4A2F] border-[#8B6F47]/40 hover:bg-[#F0E8D5]')
            }
          >
            {`Custom Items (${customItems.length})`}
          </button>
        </div>
      </div>

      {/* Item list */}
      <div className="relative flex-1 min-h-0">
        <div ref={listRef} className="h-full overflow-y-auto p-3 min-h-0 custom-scrollbar">
          {loading && tab === 'dnd' && search.length >= 2 ? (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 text-[#8B6F47] mx-auto mb-2 animate-spin" />
            <div className="text-[#5C4A2F] text-sm">Searching 5e or 5.5e items...</div>
          </div>
        ) : tab === 'dnd' && search.length < 2 ? (
          <div className="text-center py-8">
            <Search className="w-10 h-10 text-[#8B6F47]/40 mx-auto mb-2" />
            <div className="text-[#5C4A2F] text-sm">Type at least 2 characters to search</div>
            <div className="text-[#8B6F47]/70 text-xs mt-1">Search for weapons, armor, potions, and magic items</div>
          </div>
        ) : tab === 'dnd' && dndItems.length === 0 && search.length >= 2 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-[#8B6F47]/40 mx-auto mb-2" />
            <div className="text-[#5C4A2F] text-sm">No 5e or 5.5e items found</div>
            <div className="text-[#8B6F47]/70 text-xs mt-1">Try a different search term</div>
          </div>
        ) : tab === 'dnd' ? (
          <div className="space-y-1.5">
            {dndItems.map((item) => (
              (() => {
                const rarityKey = item.rarity || 'none';
                const rarityDotClass = dndRarityDotByKey[rarityKey] || dndRarityDotByKey.none;
                const rarityLabel = dndRarityLabelByKey[rarityKey] || 'Mundane';
                const editionLabel = item.editionKey || 'unknown';

                return (
              <button
                key={item.index}
                onClick={() => handleSelectDndItem(item)}
                disabled={loadingDetails === item.index}
                className="btn-secondary w-full flex items-center gap-3 !px-3 !py-2.5 rounded-lg border-[#D4C4A8] bg-white/40 hover:bg-[#F5EFE0] hover:border-[#8B6F47] text-left group disabled:opacity-50 disabled:cursor-wait shadow-none"
              >
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${rarityDotClass}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#3D1409] font-medium truncate">{item.name}</div>
                  <div className="text-[11px] text-[#8B6F47]">{rarityLabel} • {item.type === 'magic' ? 'Magic Item' : 'Equipment'}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-md bg-[#E8D5B7] border border-[#D4C4A8] text-[#5C4A2F] shrink-0">
                  {editionLabel}
                </span>
                {loadingDetails === item.index ? (
                  <Loader2 className="w-4 h-4 text-[#5C1A1A] animate-spin shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-[#8B6F47]/40 group-hover:text-[#5C1A1A] transition-colors shrink-0" />
                )}
              </button>
                );
              })()
            ))}
          </div>
        ) : filteredCustomItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-[#8B6F47]/40 mx-auto mb-2" />
            <div className="text-[#5C4A2F] text-sm">No custom items available in this vault</div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredCustomItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="btn-secondary w-full flex items-center gap-3 !px-3 !py-2.5 rounded-lg border-[#D4C4A8] bg-white/40 hover:bg-[#F5EFE0] hover:border-[#8B6F47] text-left group shadow-none"
              >
                <div className={'w-2.5 h-2.5 rounded-full shrink-0 ' + (rarityDots[item.rarity] || 'bg-[#A89A7C]')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#3D1409] font-medium truncate">{item.name}</div>
                  <div className="text-[11px] text-[#8B6F47] capitalize">{item.category}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-md bg-[#E8D5B7] border border-[#D4C4A8] text-[#5C4A2F]">
                    {item.sourcebook || 'homebrew'}
                  </span>
                  <span className="text-[11px] text-[#8B6F47]">{item.weight} lbs</span>
                  <span className={'text-[11px] capitalize font-medium ' + (rarityColors[item.rarity] || '')}>
                    {item.rarity}
                  </span>
                </div>
                <Plus className="w-4 h-4 text-[#8B6F47]/40 group-hover:text-[#5C1A1A] transition-colors shrink-0" />
              </button>
            ))}
          </div>
          )}
        </div>

        {showScrollbar && (
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="absolute top-2 right-0.5 bottom-2 w-3.5 flex items-stretch cursor-pointer z-10"
          >
            <div
              onMouseDown={handleThumbMouseDown}
              className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
              style={{
                top: `${thumbTop}px`,
                height: `${thumbHeight}px`,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

function CustomItemPoolManager({
  userHomebrew,
  customItemPool,
  onSaveCustomItemPool,
  onUpdateHomebrewItem,
  onDeleteHomebrewItem,
  onClose,
  targetName,
}: {
  userHomebrew: Item[];
  customItemPool: Item[];
  onSaveCustomItemPool?: (items: Item[]) => Promise<void> | void;
  onUpdateHomebrewItem?: (item: Item) => Promise<void> | void;
  onDeleteHomebrewItem?: (itemId: string) => Promise<void> | void;
  onClose: () => void;
  targetName: string;
}) {
  const [search, setSearch] = useState('');
  const [isSavingPool, setIsSavingPool] = useState(false);
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>(() => customItemPool.map((item) => item.id));
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const {
    showScrollbar,
    thumbTop,
    thumbHeight,
    trackRef,
    handleTrackClick,
    handleThumbMouseDown,
  } = useCustomScrollbar(listRef);

  useEffect(() => {
    setSelectedPoolIds(customItemPool.map((item) => item.id));
  }, [customItemPool]);

  const filteredHomebrewItems = userHomebrew.filter((item) => {
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleTogglePool = (itemId: string) => {
    setSelectedPoolIds((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      return [...prev, itemId];
    });
  };

  const handleSavePool = async () => {
    if (!onSaveCustomItemPool) return;
    const selectedSet = new Set(selectedPoolIds);
    const nextPool = userHomebrew.filter((item) => selectedSet.has(item.id));

    setIsSavingPool(true);
    try {
      await onSaveCustomItemPool(nextPool);
    } finally {
      setIsSavingPool(false);
    }
  };

  const hasPoolChanges = (() => {
    const current = new Set(customItemPool.map((item) => item.id));
    const next = new Set(selectedPoolIds);
    if (current.size !== next.size) return true;
    for (const id of current) {
      if (!next.has(id)) return true;
    }
    return false;
  })();

  return (
    <>
      <div className="sticky top-0 bg-[#F5EFE0] p-4 sm:p-5 pb-3 flex items-start justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#3D1409]">Manage Custom Item Pool</h2>
            <p className="text-[#5C4A2F] text-xs mt-0.5">Choose which homebrew items appear for {targetName}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost !p-1.5 text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-[#8B6F47]/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C4A2F]" />
          <input
            type="text"
            placeholder="Search homebrew items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border-2 border-[#8B6F47]/60 rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F]"
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div ref={listRef} className="h-full overflow-y-auto p-3 min-h-0 space-y-1.5 custom-scrollbar">
          {filteredHomebrewItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-[#8B6F47]/40 mx-auto mb-2" />
            <div className="text-[#5C4A2F] text-sm">No homebrew items found</div>
          </div>
        ) : (
          filteredHomebrewItems.map((item) => {
            const enabled = selectedPoolIds.includes(item.id);

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedItem(item);
                  }
                }}
                role="button"
                tabIndex={0}
                className="btn-secondary active:scale-100 w-full flex items-center gap-3 !px-3 !py-2.5 rounded-lg border-[#D4C4A8] bg-white/40 hover:bg-[#F5EFE0] hover:border-[#8B6F47] text-left group"
              >
                <div className={'w-2.5 h-2.5 rounded-full shrink-0 ' + (rarityDots[item.rarity] || 'bg-[#A89A7C]')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#3D1409] font-medium truncate">{item.name}</div>
                  <div className="text-[11px] text-[#8B6F47] capitalize">{item.category}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePool(item.id);
                  }}
                  className={
                    'active:scale-100 w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors touch-manipulation ' +
                    (enabled ? 'bg-[#3D5A27] border-[#3D5A27]' : 'border-[#8B6F47]/60 bg-white/70')
                  }
                  aria-label={enabled ? 'Remove from custom item pool' : 'Add to custom item pool'}
                  title={enabled ? 'Remove from pool' : 'Add to pool'}
                >
                  {enabled ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : null}
                </button>
              </div>
            );
          })
          )}
        </div>

        {showScrollbar && (
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="absolute top-2 right-0.5 bottom-2 w-3.5 flex items-stretch cursor-pointer z-10"
          >
            <div
              onMouseDown={handleThumbMouseDown}
              className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
              style={{
                top: `${thumbTop}px`,
                height: `${thumbHeight}px`,
              }}
            />
          </div>
        )}
      </div>

      <div className="p-3 border-t-2 border-[#DCC8A8]">
        <button
          onClick={() => void handleSavePool()}
          disabled={!hasPoolChanges || isSavingPool}
          className="btn-primary active:scale-100 w-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSavingPool ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Custom Item Pool'
          )}
        </button>
      </div>

      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={async (updates) => {
            const updatedItem = { ...selectedItem, ...updates };
            if (onUpdateHomebrewItem) {
              await onUpdateHomebrewItem(updatedItem);
            }
            setSelectedItem(updatedItem);
          }}
          onDelete={async () => {
            const deletingId = selectedItem.id;
            if (onDeleteHomebrewItem) {
              await onDeleteHomebrewItem(deletingId);
            }
            setSelectedPoolIds((prev) => prev.filter((id) => id !== deletingId));
            setSelectedItem(null);
          }}
          showDeleteAction
        />
      )}
    </>
  );
}

function CustomItemForm({
  onCreate,
  onClose,
  targetName,
}: {
  onCreate: (item: Omit<Item, 'id'>) => Promise<void> | void;
  onClose: () => void;
  targetName: string;
}) {
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const [showDescriptionScrollbar, setShowDescriptionScrollbar] = useState(false);
  const [descriptionThumbTop, setDescriptionThumbTop] = useState(0);
  const [descriptionThumbHeight, setDescriptionThumbHeight] = useState(0);
  const descriptionTrackRef = useRef<HTMLDivElement | null>(null);
  const isDescriptionDragging = useRef(false);
  const descriptionDragStartY = useRef(0);
  const descriptionDragStartTop = useRef(0);

  const updateDescriptionScrollbar = () => {
    const el = descriptionRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight + 1;
    setShowDescriptionScrollbar(hasScroll);

    if (!hasScroll) {
      setDescriptionThumbTop(0);
      setDescriptionThumbHeight(0);
      return;
    }

    const trackH = Math.max(1, descriptionTrackRef.current?.clientHeight ?? clientHeight);
    const ratio = clientHeight / scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const tTop = maxTop * (scrollTop / Math.max(1, scrollHeight - clientHeight));
    setDescriptionThumbHeight(tHeight);
    setDescriptionThumbTop(tTop);
  };

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el) return;

    const handler = () => updateDescriptionScrollbar();
    el.addEventListener('scroll', handler);
    el.addEventListener('input', handler);

    const resizeObserver = new ResizeObserver(handler);
    resizeObserver.observe(el);

    const timer = setTimeout(handler, 100);

    return () => {
      el.removeEventListener('scroll', handler);
      el.removeEventListener('input', handler);
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleDescriptionThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDescriptionDragging.current = true;
    descriptionDragStartY.current = e.clientY;
    descriptionDragStartTop.current = descriptionThumbTop;

    const handleMove = (ev: MouseEvent) => {
      if (!isDescriptionDragging.current || !descriptionRef.current) return;
      const el = descriptionRef.current;
      const trackH = Math.max(1, descriptionTrackRef.current?.clientHeight ?? el.clientHeight);
      const delta = ev.clientY - descriptionDragStartY.current;
      const ratio = el.clientHeight / el.scrollHeight;
      const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
      const maxTop = Math.max(0, trackH - tHeight);
      const newTop = Math.min(maxTop, Math.max(0, descriptionDragStartTop.current + delta));
      const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
      el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
    };

    const handleUp = () => {
      isDescriptionDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleDescriptionTrackClick = (e: React.MouseEvent) => {
    if (!descriptionTrackRef.current || !descriptionRef.current) return;
    const rect = descriptionTrackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const el = descriptionRef.current;
    const trackH = Math.max(1, rect.height);
    const ratio = el.clientHeight / el.scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const newTop = Math.min(maxTop, Math.max(0, clickY - tHeight / 2));
    const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
    el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
  };

  const normalizeGpValue = (value: number): { value: number; valueUnit: 'gp' | 'sp' | 'cp' } => {
    if (value > 0 && value < 1) {
      if (value < 0.1) {
        return { value: Number((value * 100).toFixed(2)), valueUnit: 'cp' };
      }
      return { value: Number((value * 10).toFixed(2)), valueUnit: 'sp' };
    }

    return { value: Number(value.toFixed(2)), valueUnit: 'gp' };
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'adventuring-gear' as Category,
    rarity: 'common' as Rarity,
    quantity: 1,
    weight: '',
    value: '',
    attunement: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    quantity?: string;
    weight?: string;
    value?: string;
  }>({});

  const inputBaseClass =
    'w-full px-3 py-2 bg-white/70 border-3 rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:ring-2 transition-all duration-300';

  const inputClass = (hasError: boolean) =>
    hasError
      ? `${inputBaseClass} border-[#B44444] focus:border-[#8B3A3A] focus:ring-[#8B3A3A]/20`
      : `${inputBaseClass} border-[#8B6F47] focus:border-[#5C1A1A] focus:ring-[#5C1A1A]/20`;

  const validateForm = () => {
    const nextErrors: {
      name?: string;
      quantity?: string;
      weight?: string;
      value?: string;
    } = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }

    if (!Number.isFinite(formData.quantity) || formData.quantity < 1) {
      nextErrors.quantity = 'Quantity must be at least 1';
    }

    if (formData.weight !== '') {
      const parsedWeight = Number(formData.weight);
      if (!Number.isFinite(parsedWeight) || parsedWeight < 0) {
        nextErrors.weight = 'Weight must be 0 or greater';
      }
    }

    if (formData.value !== '') {
      const parsedValue = Number(formData.value);
      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        nextErrors.value = 'Value must be 0 or greater';
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const item: Omit<Item, 'id'> = {
      name: formData.name.trim(),
      sourcebook: 'homebrew',
      category: formData.category,
      rarity: formData.rarity,
      quantity: formData.quantity,
      weight: formData.weight === '' ? 0 : Number(formData.weight),
      attunement: formData.attunement,
      createdAt: new Date().toISOString(),
    };

    // Only add optional fields if they have values
    if (formData.description.trim()) {
      item.description = formData.description;
    }
    const parsedValue = formData.value === '' ? 0 : Number(formData.value);
    if (Number.isFinite(parsedValue) && parsedValue > 0) {
      const normalizedValue = normalizeGpValue(parsedValue);
      item.value = normalizedValue.value;
      item.valueUnit = normalizedValue.valueUnit;
    } else {
      item.valueUnknown = true;
    }
    await onCreate(item);
    onClose();
  };

  return (
    <>
      <div className="bg-[#F5EFE0] p-3 sm:p-4 pb-2 flex items-start justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-linear-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md shrink-0">
            <Package className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#3D1409] leading-tight">Create Custom Item</h2>
            <p className="text-[#5C4A2F] text-xs">Save to your homebrew for {targetName}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-ghost !p-1.5 text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mx-3 sm:mx-4 border-t-2 border-[#DCC8A8] shrink-0" />

      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 gap-2">
        {/* Item Name */}
        <div className="shrink-0">
          <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
            Item Name <span className="text-[#8B3A3A]">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className={inputClass(!!errors.name)}
            placeholder="e.g., Flaming Longsword"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="mt-1 text-xs text-[#8B3A3A]">{errors.name}</p>}
        </div>

        {/* Description - flexible height */}
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="block text-[#3D1409] font-semibold text-sm mb-0.5 shrink-0">Description</label>
          <div className="relative flex-1 min-h-0">
            <textarea
              ref={descriptionRef}
              defaultValue={formData.description}
              onInput={(e) => {
                const el = e.currentTarget;
                el.scrollTop = el.scrollHeight;
                setFormData((prev) => ({ ...prev, description: el.value }));
                updateDescriptionScrollbar();
              }}
              onKeyUp={(e) => {
                const el = e.currentTarget;
                el.scrollTop = el.scrollHeight;
                setFormData((prev) => ({ ...prev, description: el.value }));
                updateDescriptionScrollbar();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              className="w-full h-full min-h-12 pl-3 pr-10 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 custom-scrollbar resize-none"
              placeholder="Describe the item..."
            />

            {showDescriptionScrollbar && (
              <div
                ref={descriptionTrackRef}
                onClick={handleDescriptionTrackClick}
                className="absolute top-2 right-1 bottom-3 w-3.5 flex items-stretch cursor-pointer"
              >
                <div
                  onMouseDown={handleDescriptionThumbMouseDown}
                  className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                  style={{
                    top: `${descriptionThumbTop}px`,
                    height: `${descriptionThumbHeight}px`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category + Rarity + Attunement */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
              Category <span className="text-[#8B3A3A]">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{formatCategoryLabel(cat)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
              Rarity <span className="text-[#8B3A3A]">*</span>
            </label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
              className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
            >
              {rarities.map((rar) => (
                <option key={rar} value={rar} className="capitalize">{rar}</option>
              ))}
            </select>
          </div>

          <div className="pt-6">
            <label className="flex h-[42px] items-center gap-2.5 cursor-pointer px-3 bg-white/40 border-2 border-[#DCC8A8] rounded-xl hover:bg-white/60 transition-colors">
              <input
                type="checkbox"
                checked={formData.attunement}
                onChange={(e) => setFormData({ ...formData, attunement: e.target.checked })}
                className="w-4 h-4 rounded border-[#8B6F47] bg-white/70 text-[#5C1A1A] accent-[#5C1A1A]"
              />
              <span className="text-[#3D1409] text-sm font-semibold">Requires Attunement</span>
            </label>
          </div>
        </div>

        {/* Quantity + Weight + Value */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
              Quantity <span className="text-[#8B3A3A]">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => {
                setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 });
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
              }}
              className={inputClass(!!errors.quantity)}
              placeholder="1"
              aria-invalid={!!errors.quantity}
            />
            {errors.quantity && <p className="mt-1 text-xs text-[#8B3A3A]">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => {
                setFormData({ ...formData, weight: e.target.value });
                if (errors.weight) setErrors((prev) => ({ ...prev, weight: undefined }));
              }}
              className={inputClass(!!errors.weight)}
              placeholder="0.0"
              aria-invalid={!!errors.weight}
            />
            {errors.weight && <p className="mt-1 text-xs text-[#8B3A3A]">{errors.weight}</p>}
          </div>

          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Value (gp)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.value}
                onChange={(e) => {
                  setFormData({ ...formData, value: e.target.value });
                  if (errors.value) setErrors((prev) => ({ ...prev, value: undefined }));
                }}
                className={inputClass(!!errors.value)}
                placeholder="Not estimated"
                aria-invalid={!!errors.value}
              />
            {errors.value && <p className="mt-1 text-xs text-[#8B3A3A]">{errors.value}</p>}
          </div>
        </div>

        <div className="border-t-2 border-[#DCC8A8] shrink-0" />

        <div className="flex gap-3 shrink-0">
          <button
            type="submit"
            className="btn-primary flex-1 group px-4 py-2.5"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            Create Item
          </button>
        </div>
      </form>
    </>
  );
}

export function AddItemModal({
  onClose,
  onAdd,
  targetName,
  isDM,
  customItems = [],
  userHomebrew = [],
  customItemPool = [],
  onSaveCustomItemPool,
  onCreateHomebrew,
  onUpdateHomebrewItem,
  onDeleteHomebrewItem,
}: AddItemModalProps) {
  const [mode, setMode] = useState<'pick' | 'manage' | 'custom'>('pick');
  const backdropMouseDown = useRef(false);

  const handleSelectTemplate = (template: Item) => {
    const { id, ...rest } = template;
    onAdd({ ...rest, createdAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => { backdropMouseDown.current = e.target === e.currentTarget; }}
      onMouseUp={(e) => {
        if (backdropMouseDown.current && e.target === e.currentTarget) onClose();
        backdropMouseDown.current = false;
      }}
    >
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)', height: 'min(90vh, 700px)' }}
      >
        {/* GM gets tabs to switch between pool management and homebrew creation */}
        {isDM && (
          <div className="flex border-b-3 border-[#8B6F47]/40 bg-[#E8D5B7] rounded-t-xl overflow-hidden">
            <button
              onClick={() => setMode('pick')}
              className={
                'flex-1 text-sm py-3 ' +
                (mode === 'pick'
                  ? 'btn-primary rounded-none'
                  : 'btn-secondary rounded-none text-[#5C4A2F] hover:bg-[#F5EFE0]/50 hover:text-[#3D1409] border-transparent shadow-none')
              }
            >
              Add Items
            </button>
            <button
              onClick={() => setMode('manage')}
              className={
                'flex-1 text-sm py-3 ' +
                (mode === 'manage'
                  ? 'btn-primary rounded-none'
                  : 'btn-secondary rounded-none text-[#5C4A2F] hover:bg-[#F5EFE0]/50 hover:text-[#3D1409] border-transparent shadow-none')
              }
            >
              Manage Pool
            </button>
            <button
              onClick={() => setMode('custom')}
              className={
                'flex-1 text-sm py-3 ' +
                (mode === 'custom'
                  ? 'btn-primary rounded-none'
                  : 'btn-secondary rounded-none text-[#5C4A2F] hover:bg-[#F5EFE0]/50 hover:text-[#3D1409] border-transparent shadow-none')
              }
            >
              Create Homebrew
            </button>
          </div>
        )}

        {mode === 'pick' ? (
          <TemplateItemPicker
            customItems={customItems}
            onSelect={handleSelectTemplate}
            onClose={onClose}
            targetName={targetName}
          />
        ) : mode === 'manage' ? (
          <CustomItemPoolManager
            userHomebrew={userHomebrew}
            customItemPool={customItemPool}
            onSaveCustomItemPool={onSaveCustomItemPool}
            onUpdateHomebrewItem={onUpdateHomebrewItem}
            onDeleteHomebrewItem={onDeleteHomebrewItem}
            onClose={onClose}
            targetName={targetName}
          />
        ) : (
          <CustomItemForm onCreate={onCreateHomebrew || onAdd} onClose={onClose} targetName={targetName} />
        )}
      </div>
    </div>
  );
}
