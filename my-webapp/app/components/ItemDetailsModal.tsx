import { useState, useRef } from 'react';
import { X, Trash2, Save, Edit2, Coins, Weight, Package, Sparkles, Star, StickyNote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Item, Category, Rarity } from '../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface ItemDetailsModalProps {
  item: Item;
  onClose: () => void;
  onUpdate: (updates: Partial<Item>) => void;
  onDelete: () => void;
  showDeleteAction?: boolean;
}

const categories: Category[] = ['weapon', 'armor', 'potion', 'magic', 'treasure', 'misc'];
const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];

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

export function ItemDetailsModal({ item, onClose, onUpdate, onDelete, showDeleteAction = true }: ItemDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const backdropMouseDown = useRef(false);
  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description,
    category: item.category,
    rarity: item.rarity,
    quantity: item.quantity,
    weight: item.weight.toString(),
    value: item.value?.toString() || '',
    notes: item.notes || '',
    attunement: item.attunement || false,
    attuned: item.attuned || false,
  });

  const handleSave = async () => {
    await onUpdate({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      rarity: formData.rarity,
      quantity: formData.quantity,
      weight: parseFloat(formData.weight),
      value: formData.value ? parseFloat(formData.value) : undefined,
      notes: formData.notes || undefined,
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
    onDelete();
  };

  const gradient = rarityGradients[item.rarity] || rarityGradients.common;

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
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)', maxHeight: 'min(90vh, 700px)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#F5EFE0] p-4 sm:p-5 pb-3 flex items-start justify-between z-10 rounded-t-xl shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 bg-linear-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
              <Package className="w-5 h-5 text-white" />
            </div>
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
              <p className={`text-xs mt-0.5 capitalize ${rarityColors[item.rarity]}`}>
                {item.rarity} {item.category}
                {item.quantity > 1 && <span className="text-[#5C4A2F] ml-1">× {item.quantity}</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-3 shrink-0">
            {!isEditing && (
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
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {isEditing ? (
            <>
              <div>
                <label className="block text-[#3D1409] font-semibold text-sm mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 min-h-20 resize-none"
                  placeholder="Describe the item..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#3D1409] font-semibold text-sm mb-1">
                    Category <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="capitalize">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#3D1409] font-semibold text-sm mb-1">
                    Rarity <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
                    className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 capitalize"
                  >
                    {rarities.map(rar => (
                      <option key={rar} value={rar} className="capitalize">{rar}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#3D1409] font-semibold text-sm mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-[#3D1409] font-semibold text-sm mb-1">
                    Weight (lbs) <span className="text-[#8B3A3A]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-[#3D1409] font-semibold text-sm mb-1">Value (gp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                    placeholder="0"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#3D1409] font-semibold text-sm mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 min-h-16 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-white/40 border-2 border-[#DCC8A8] rounded-xl hover:bg-white/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.attunement}
                      onChange={(e) => setFormData({ ...formData, attunement: e.target.checked })}
                      className="w-4 h-4 rounded border-[#8B6F47] bg-white/70 text-[#5C1A1A] accent-[#5C1A1A]"
                    />
                    <span className="text-[#3D1409] text-sm font-semibold">Requires Attunement</span>
                  </label>
                </div>

                {formData.attunement && (
                  <div className="col-span-2">
                    <label className="flex items-center gap-2.5 cursor-pointer p-2.5 bg-[#F3E5F5]/40 border-2 border-[#7E57A2]/30 rounded-xl hover:bg-[#F3E5F5]/60 transition-colors">
                      <Star className={'w-4 h-4 ' + (formData.attuned ? 'text-[#B8860B] fill-[#B8860B]' : 'text-[#8B6F47]/50')} />
                      <input
                        type="checkbox"
                        checked={formData.attuned}
                        onChange={(e) => setFormData({ ...formData, attuned: e.target.checked })}
                        className="w-4 h-4 rounded border-[#8B6F47] bg-white/70 text-[#5C1A1A] accent-[#5C1A1A]"
                      />
                      <span className="text-[#5E3A7C] text-sm font-semibold">Attuned</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-[#DCC8A8]" />

              <div className="flex gap-3">
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
                  Save Changes
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
                  {item.value ? (
                    <p className="text-[#B8860B] font-bold">
                      {(item.value * item.quantity).toLocaleString()} gp
                      {item.quantity > 1 && (
                        <span className="text-[#5C4A2F] text-xs font-normal ml-1">
                          ({item.value} × {item.quantity})
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-[#8B6F47]/60 text-sm italic">No value</p>
                  )}
                </div>
              </div>

              {/* Attunement badge with toggle */}
              {item.attunement && (
                <div className="flex items-center justify-between bg-[#F3E5F5]/70 border-2 border-[#7E57A2]/40 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7E57A2]" />
                    <span className="text-[#5E3A7C] text-sm font-semibold">Requires Attunement</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onUpdate({ attuned: !item.attuned }); }}
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

              {showDeleteAction && (
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
