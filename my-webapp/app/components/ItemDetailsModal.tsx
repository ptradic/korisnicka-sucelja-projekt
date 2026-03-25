import { useEffect, useState, useRef } from 'react';
import { X, Trash2, Save, Edit2, Coins, Weight, Package, Sparkles, Star, StickyNote, Sword, Shield, Droplet, Backpack, Gem } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeCategory, type Item, type Category, type Rarity, type ValueUnit } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useCustomScrollbar } from '../hooks/useCustomScrollbar';

interface ItemDetailsModalProps {
  item: Item;
  onClose: () => void;
  onUpdate?: (updates: Partial<Item>) => void;
  onDelete?: () => void;
  showDeleteAction?: boolean;
  canEdit?: boolean;
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

const rarityGradients: Record<string, string> = {
  common: 'from-[#8B6F47] to-[#A0845A]',
  uncommon: 'from-[#3D5A27] to-[#5C7A3B]',
  rare: 'from-[#2C4A7C] to-[#4A6FA5]',
  'very rare': 'from-[#5E3A7C] to-[#7E57A2]',
  legendary: 'from-[#8B6914] to-[#B8860B]',
  artifact: 'from-[#6B2020] to-[#8B3A3A]',
};

const categoryIcons: Partial<Record<Category, React.ComponentType<{ className?: string }>>> = {
  weapons: Sword,
  armor: Shield,
  consumables: Droplet,
  'magic-gear': Sparkles,
  'adventuring-gear': Backpack,
  'wealth-valuables': Gem,
  hidden: Package,
};

function normalizeValueUnit(value: number, valueUnit: ValueUnit): { value: number; valueUnit: ValueUnit } {
  if (valueUnit === 'gp' && value > 0 && value < 1) {
    if (value < 0.1) {
      return { value: Number((value * 100).toFixed(2)), valueUnit: 'cp' };
    }
    return { value: Number((value * 10).toFixed(2)), valueUnit: 'sp' };
  }

  return { value: Number(value.toFixed(2)), valueUnit };
}

function toGpValue(value: number, valueUnit: ValueUnit): number {
  if (valueUnit === 'sp') return Number((value / 10).toFixed(4));
  if (valueUnit === 'cp') return Number((value / 100).toFixed(4));
  return value;
}

function getValueColor(valueUnit: ValueUnit): string {
  if (valueUnit === 'sp') return 'text-[#7A869A]';
  if (valueUnit === 'cp') return 'text-[#7A3E2A]';
  return 'text-[#B8860B]';
}

export function ItemDetailsModal({ item, onClose, onUpdate, onDelete, showDeleteAction = true, canEdit = true }: ItemDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const backdropMouseDown = useRef(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const editDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const editDescriptionTrackRef = useRef<HTMLDivElement | null>(null);
  const isEditDescriptionDragging = useRef(false);
  const editDescriptionDragStartY = useRef(0);
  const editDescriptionDragStartTop = useRef(0);
  const {
    showScrollbar,
    thumbTop,
    thumbHeight,
    trackRef,
    handleTrackClick,
    handleThumbMouseDown,
  } = useCustomScrollbar(contentRef);
  const [showEditDescriptionScrollbar, setShowEditDescriptionScrollbar] = useState(false);
  const [editDescriptionThumbTop, setEditDescriptionThumbTop] = useState(0);
  const [editDescriptionThumbHeight, setEditDescriptionThumbHeight] = useState(0);

  const updateEditDescriptionScrollbar = () => {
    const el = editDescriptionRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight + 1;
    setShowEditDescriptionScrollbar(hasScroll);

    if (!hasScroll) {
      setEditDescriptionThumbTop(0);
      setEditDescriptionThumbHeight(0);
      return;
    }

    const trackH = Math.max(1, editDescriptionTrackRef.current?.clientHeight ?? clientHeight);
    const ratio = clientHeight / scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const tTop = maxTop * (scrollTop / Math.max(1, scrollHeight - clientHeight));
    setEditDescriptionThumbHeight(tHeight);
    setEditDescriptionThumbTop(tTop);
  };

  useEffect(() => {
    if (!isEditing) return;

    const el = editDescriptionRef.current;
    if (!el) return;

    const handler = () => updateEditDescriptionScrollbar();
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
  }, [isEditing]);

  const handleEditDescriptionThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isEditDescriptionDragging.current = true;
    editDescriptionDragStartY.current = e.clientY;
    editDescriptionDragStartTop.current = editDescriptionThumbTop;

    const handleMove = (ev: MouseEvent) => {
      if (!isEditDescriptionDragging.current || !editDescriptionRef.current) return;
      const el = editDescriptionRef.current;
      const trackH = Math.max(1, editDescriptionTrackRef.current?.clientHeight ?? el.clientHeight);
      const delta = ev.clientY - editDescriptionDragStartY.current;
      const ratio = el.clientHeight / el.scrollHeight;
      const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
      const maxTop = Math.max(0, trackH - tHeight);
      const newTop = Math.min(maxTop, Math.max(0, editDescriptionDragStartTop.current + delta));
      const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
      el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
    };

    const handleUp = () => {
      isEditDescriptionDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleEditDescriptionTrackClick = (e: React.MouseEvent) => {
    if (!editDescriptionTrackRef.current || !editDescriptionRef.current) return;
    const rect = editDescriptionTrackRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const el = editDescriptionRef.current;
    const trackH = Math.max(1, rect.height);
    const ratio = el.clientHeight / el.scrollHeight;
    const tHeight = Math.min(trackH, Math.max(24, trackH * ratio));
    const maxTop = Math.max(0, trackH - tHeight);
    const newTop = Math.min(maxTop, Math.max(0, clickY - tHeight / 2));
    const scrollRatio = maxTop > 0 ? newTop / maxTop : 0;
    el.scrollTop = scrollRatio * Math.max(0, el.scrollHeight - el.clientHeight);
  };

  const initialGpValue = item.value && item.value > 0
    ? toGpValue(item.value, (item.valueUnit || 'gp') as ValueUnit)
    : null;
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    category: item.category,
    rarity: item.rarity,
    quantity: item.quantity,
    weight: item.weight.toString(),
    value: initialGpValue ? initialGpValue.toString() : '',
    attunement: item.attunement || false,
    attuned: item.attuned || false,
  });

  const handleSave = async () => {
    if (!onUpdate) {
      setIsEditing(false);
      return;
    }

    const parsedValue = formData.value ? parseFloat(formData.value) : 0;
    const hasEstimatedValue = Number.isFinite(parsedValue) && parsedValue > 0;
    const parsedWeight = formData.weight === '' ? 0 : Number(formData.weight);
    const normalizedValue = hasEstimatedValue
      ? normalizeValueUnit(parsedValue, 'gp')
      : null;

    await onUpdate({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      rarity: formData.rarity,
      quantity: formData.quantity,
      weight: Number.isFinite(parsedWeight) && parsedWeight >= 0 ? parsedWeight : 0,
      value: normalizedValue ? normalizedValue.value : undefined,
      valueUnit: normalizedValue ? normalizedValue.valueUnit : undefined,
      valueUnknown: hasEstimatedValue ? undefined : true,
      attunement: formData.attunement,
      attuned: formData.attunement ? formData.attuned : false,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete?.();
  };

  const displayValue = item.value && item.value > 0
    ? normalizeValueUnit(item.value, (item.valueUnit || 'gp') as ValueUnit)
    : null;

  const gradient = rarityGradients[item.rarity] || rarityGradients.common;
  const activeCategory = normalizeCategory(isEditing ? formData.category : item.category);
  const ItemTypeIcon = categoryIcons[activeCategory] || Package;

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
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)', maxHeight: 'min(90vh, 700px)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#F5EFE0] p-4 sm:p-5 pb-3 flex items-start justify-between z-10 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
              <ItemTypeIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] font-extrabold focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    />
                  ) : (
                    <h2 className="text-lg font-extrabold text-[#3D1409] truncate">{item.name}</h2>
                  )}
                </div>

                {!isEditing && (
                  <div className="shrink-0 text-right leading-tight pt-0.5">
                    <p className={`text-sm font-extrabold capitalize ${rarityColors[item.rarity]}`}>
                      {item.rarity} {item.category}
                      {item.quantity > 1 && <span className="text-[#5C4A2F] ml-1">× {item.quantity}</span>}
                    </p>
                    <p className="text-[10px] mt-0.5 text-[#5C4A2F] uppercase tracking-wide">Sourcebook: {item.sourcebook || 'unknown'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3 shrink-0">
            {!isEditing && canEdit && onUpdate && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 sm:mx-5 border-t-2 border-[#DCC8A8] shrink-0" />

        {/* Content */}
        <div className="relative flex-1 min-h-0 flex">
          <div
            ref={contentRef}
            className={
              isEditing
                ? 'p-4 sm:p-5 overflow-y-auto flex-1 min-h-0 flex flex-col gap-2 custom-scrollbar'
                : 'p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar'
            }
          >
          {isEditing ? (
            <>
              <div className="flex-1 min-h-0 flex flex-col">
                <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Description</label>
                <div className="relative flex-1 min-h-0">
                  <textarea
                    ref={editDescriptionRef}
                    defaultValue={formData.description}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      setFormData((prev) => ({ ...prev, description: el.value }));
                      updateEditDescriptionScrollbar();
                    }}
                    onKeyUp={(e) => {
                      const el = e.currentTarget;
                      setFormData((prev) => ({ ...prev, description: el.value }));
                      updateEditDescriptionScrollbar();
                    }}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                    }}
                    className="w-full h-full min-h-28 pl-3 pr-10 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 custom-scrollbar resize-none"
                    placeholder="Describe the item..."
                  />

                  {showEditDescriptionScrollbar && (
                    <div
                      ref={editDescriptionTrackRef}
                      onClick={handleEditDescriptionTrackClick}
                      className="absolute top-2 right-1 bottom-3 w-3.5 flex items-stretch cursor-pointer"
                    >
                      <div
                        onMouseDown={handleEditDescriptionThumbMouseDown}
                        className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                        style={{
                          top: `${editDescriptionThumbTop}px`,
                          height: `${editDescriptionThumbHeight}px`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
                <div className="order-1">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                    Category <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{formatCategoryLabel(cat)}</option>
                    ))}
                  </select>
                </div>

                <div className="order-2">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
                    Rarity <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
                  >
                    {rarities.map(rar => (
                      <option key={rar} value={rar} className="capitalize">{rar}</option>
                    ))}
                  </select>
                </div>

                <div className="order-3">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Attunement</label>
                  <select
                    value={formData.attunement ? 'requires' : 'does-not-require'}
                    onChange={(e) => {
                      const requiresAttunement = e.target.value === 'requires';
                      setFormData({
                        ...formData,
                        attunement: requiresAttunement,
                        attuned: requiresAttunement ? formData.attuned : false,
                      });
                    }}
                    className="w-full px-3 py-2 min-h-[42px] bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                  >
                    <option value="requires">Requires</option>
                    <option value="does-not-require">Doesn't require</option>
                  </select>
                </div>

                <div className="order-4">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                  />
                </div>

                <div className="order-5">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="0.0"
                  />
                </div>

                <div className="order-6">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Value (gp)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="Not estimated"
                  />
                </div>
              </div>

              <div className="border-t-2 border-[#DCC8A8] shrink-0" />

              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1 px-4 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1 group px-4 py-2.5"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Description */}
              {item.description && (
                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-2">
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>Description</span>
                  </div>
                  <div className="text-[#3D1409] text-sm leading-relaxed space-y-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-[#2D0F06]">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        code: ({ children }) => <code className="font-mono text-[0.85em] bg-[#F5EFE0] px-1 py-0.5 rounded">{children}</code>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto rounded-lg border border-[#DCC8A8] bg-[#F8F2E6]">
                            <table className="min-w-full border-collapse">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-[#E8D5B7]">{children}</thead>,
                        tbody: ({ children }) => <tbody>{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-[#DCC8A8] last:border-0">{children}</tr>,
                        th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-[#3D1409]">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 text-[#3D1409] align-top">{children}</td>,
                      }}
                    >
                      {item.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Weight className="w-3.5 h-3.5" />
                    <span>Weight</span>
                  </div>
                  <p className="text-[#3D1409] font-bold">
                    {(item.weight * item.quantity).toFixed(1)} lbs
                    {item.quantity > 1 && (
                      <span className="text-[#5C4A2F] text-xs font-normal ml-1">
                        ({item.weight} × {item.quantity})
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Value</span>
                  </div>
                  {item.valueUnknown || !displayValue ? (
                    <p className="text-[#8B6F47] font-bold">Not estimated</p>
                  ) : (
                    <p className={getValueColor(displayValue.valueUnit) + ' font-bold'}>
                      {(displayValue.value * item.quantity).toLocaleString()} {displayValue.valueUnit}
                      {item.quantity > 1 && (
                        <span className="text-[#5C4A2F] text-xs font-normal ml-1">
                          ({displayValue.value} {displayValue.valueUnit} × {item.quantity})
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              {/* Attunement badge with toggle */}
              {item.attunement && canEdit && onUpdate && (
                <div className="flex items-center justify-between bg-[#F3E5F5]/70 border-2 border-[#7E57A2]/40 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7E57A2]" />
                    <span className="text-[#5E3A7C] text-sm font-semibold">Requires Attunement</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ attuned: !item.attuned });
                    }}
                    className={'flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-200 cursor-pointer '
                      + (item.attuned
                        ? 'bg-[#7E57A2]/20 text-[#5E3A7C] hover:bg-[#7E57A2]/30'
                        : 'bg-white/50 text-[#8B6F47] hover:bg-white/70')
                    }
                    title={item.attuned ? 'Click to unattune' : 'Click to attune'}
                  >
                    <Star className={'w-4 h-4 ' + (item.attuned ? 'text-[#B8860B] fill-[#B8860B]' : 'text-[#8B6F47]/60')} />
                    <span className="text-xs font-semibold">{item.attuned ? 'Attuned' : 'Not Attuned'}</span>
                  </button>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div className="bg-white/50 border-2 border-[#DCC8A8] rounded-xl p-3.5">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-xs font-semibold uppercase tracking-wider mb-2">
                    <StickyNote className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </div>
                  <p className="text-[#3D1409] text-sm leading-relaxed">{item.notes}</p>
                </div>
              )}

              <div className="border-t-2 border-[#DCC8A8]" />

              {showDeleteAction && onDelete && (
                <button
                  onClick={handleDelete}
                  className="btn-secondary w-full px-4 py-2.5 bg-[#FFEBEE]/80 hover:bg-[#FFCDD2] border-[#8B3A3A]/60 hover:border-[#8B3A3A] text-[#6B2020]"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Item
                </button>
              )}
            </>
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
      </div>

      {showDeleteConfirm && (
        <ConfirmDeleteModal
          title="Delete Item"
          message={`Are you sure you want to delete "${item.name}"? This cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
