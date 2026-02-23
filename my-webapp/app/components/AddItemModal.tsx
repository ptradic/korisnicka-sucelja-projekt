import { useState, useRef } from 'react';
import { X, Search, Plus, Package } from 'lucide-react';
import type { Item, Category, Rarity } from '../types';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
  targetName: string;
  isDM?: boolean;
  templateItems?: Item[];
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

const rarityDots: Record<string, string> = {
  common: 'bg-[#A89A7C]',
  uncommon: 'bg-[#5C7A3B]',
  rare: 'bg-[#4A6FA5]',
  'very rare': 'bg-[#7E57A2]',
  legendary: 'bg-[#B8860B]',
  artifact: 'bg-[#8B3A3A]',
};

function TemplateItemPicker({
  templateItems,
  onSelect,
  onClose,
  targetName,
}: {
  templateItems: Item[];
  onSelect: (item: Item) => void;
  onClose: () => void;
  targetName: string;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const filtered = templateItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
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
            <p className="text-[#5C4A2F] text-xs mt-0.5">Choose an item from the list</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-[#8B6F47]/30 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5C4A2F]" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/70 border-2 border-[#8B6F47]/60 rounded-lg text-[#3D1409] placeholder-[#8B6F47]/50 focus:outline-none focus:border-[#5C4A2F]"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', ...categories] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                'px-2.5 py-1 rounded-full text-xs capitalize transition-all border ' +
                (selectedCategory === cat
                  ? 'bg-[#5C1A1A] text-white border-[#3D1409]'
                  : 'bg-white/60 text-[#5C4A2F] border-[#8B6F47]/40 hover:bg-[#F0E8D5] hover:border-[#5C4A2F]')
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-[#8B6F47]/40 mx-auto mb-2" />
            <div className="text-[#5C4A2F] text-sm">No items match your search</div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#D4C4A8] bg-white/40 hover:bg-[#F5EFE0] hover:border-[#8B6F47] transition-all text-left group"
              >
                <div className={'w-2.5 h-2.5 rounded-full shrink-0 ' + (rarityDots[item.rarity] || 'bg-[#A89A7C]')} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-[#3D1409] font-medium truncate">{item.name}</div>
                  {item.description && (
                    <div className="text-[11px] text-[#8B6F47] truncate">{item.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
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
    </>
  );
}

function CustomItemForm({
  onAdd,
  onClose,
  targetName,
}: {
  onAdd: (item: Omit<Item, 'id'>) => void;
  onClose: () => void;
  targetName: string;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'misc' as Category,
    rarity: 'common' as Rarity,
    quantity: 1,
    weight: '',
    value: '',
    notes: '',
    attunement: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.weight) return;

    onAdd({
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      rarity: formData.rarity,
      quantity: formData.quantity,
      weight: parseFloat(formData.weight),
      value: formData.value ? parseFloat(formData.value) : undefined,
      notes: formData.notes || undefined,
      attunement: formData.attunement,
      createdAt: new Date().toISOString(),
    });
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
            <p className="text-[#5C4A2F] text-xs">Add to {targetName}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all">
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
            placeholder="e.g., Flaming Longsword"
            required
          />
        </div>

        {/* Description - flexible height */}
        <div className="flex-1 min-h-0 flex flex-col">
          <label className="block text-[#3D1409] font-semibold text-sm mb-0.5 shrink-0">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full flex-1 min-h-12 px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 resize-none"
            placeholder="Describe the item..."
          />
        </div>

        {/* Category + Rarity */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
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
                <option key={cat} value={cat} className="capitalize">{cat}</option>
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
        </div>

        {/* Weight + Value */}
        <div className="grid grid-cols-2 gap-2 shrink-0">
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">
              Weight (lbs) <span className="text-[#8B3A3A]">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
              placeholder="0.0"
              required
            />
          </div>
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-0.5">Value (gp)</label>
            <input
              type="number"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
              placeholder="0"
            />
          </div>
        </div>

        {/* Attunement */}
        <div className="shrink-0">
          <label className="flex items-center gap-2.5 cursor-pointer p-2 bg-white/40 border-2 border-[#DCC8A8] rounded-xl hover:bg-white/60 transition-colors">
            <input
              type="checkbox"
              checked={formData.attunement}
              onChange={(e) => setFormData({ ...formData, attunement: e.target.checked })}
              className="w-4 h-4 rounded border-[#8B6F47] bg-white/70 text-[#5C1A1A] accent-[#5C1A1A]"
            />
            <span className="text-[#3D1409] text-sm font-semibold">Requires Attunement</span>
          </label>
        </div>

        <div className="border-t-2 border-[#DCC8A8] shrink-0" />

        <div className="flex gap-3 shrink-0">
          <button
            type="submit"
            className="flex-1 group px-4 py-2.5 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-3 border-[#3D1409] flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            Create Item
          </button>
        </div>
      </form>
    </>
  );
}

export function AddItemModal({ onClose, onAdd, targetName, isDM, templateItems = [] }: AddItemModalProps) {
  const [mode, setMode] = useState<'pick' | 'custom'>(isDM ? 'custom' : 'pick');
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
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)', height: 'min(90vh, 700px)' }}
      >
        {/* GM gets tabs to switch between template picker and custom form */}
        {isDM && (
          <div className="flex border-b-3 border-[#8B6F47]/40 bg-[#E8D5B7] rounded-t-xl overflow-hidden">
            <button
              onClick={() => setMode('pick')}
              className={
                'flex-1 py-3 text-sm font-bold transition-all duration-300 ' +
                (mode === 'pick'
                  ? 'bg-[#F5EFE0] text-[#3D1409] border-b-3 border-[#5C1A1A] shadow-sm'
                  : 'text-[#5C4A2F] hover:bg-[#F5EFE0]/50 hover:text-[#3D1409]')
              }
            >
              Choose from List
            </button>
            <button
              onClick={() => setMode('custom')}
              className={
                'flex-1 py-3 text-sm font-bold transition-all duration-300 ' +
                (mode === 'custom'
                  ? 'bg-[#F5EFE0] text-[#3D1409] border-b-3 border-[#5C1A1A] shadow-sm'
                  : 'text-[#5C4A2F] hover:bg-[#F5EFE0]/50 hover:text-[#3D1409]')
              }
            >
              Create Custom
            </button>
          </div>
        )}

        {mode === 'pick' ? (
          <TemplateItemPicker
            templateItems={templateItems}
            onSelect={handleSelectTemplate}
            onClose={onClose}
            targetName={targetName}
          />
        ) : (
          <CustomItemForm onAdd={onAdd} onClose={onClose} targetName={targetName} />
        )}
      </div>
    </div>
  );
}
