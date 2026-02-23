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
      <div className="sticky top-0 bg-[#F5EFE0] border-b-4 border-[#3D1409] p-5 flex items-center justify-between z-10">
        <div>
          <h2 className="text-[#3D1409] text-lg font-bold">Add Item to {targetName}</h2>
          <p className="text-[#5C4A2F] text-sm mt-0.5">Choose an item from the list</p>
        </div>
        <button onClick={onClose} className="text-[#5C4A2F] hover:text-[#3D1409] transition-colors">
          <X className="w-6 h-6" />
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
      <div className="flex-1 overflow-y-auto p-3">
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
      <div className="sticky top-0 bg-[#F5EFE0] border-b-4 border-[#3D1409] p-5 flex items-center justify-between z-10">
        <div>
          <h2 className="text-[#3D1409] text-lg font-bold">Create Custom Item</h2>
          <p className="text-[#5C4A2F] text-sm mt-0.5">Add to {targetName}</p>
        </div>
        <button onClick={onClose} className="text-[#5C4A2F] hover:text-[#3D1409] transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[#3D1409] text-sm mb-1.5">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
              placeholder="e.g., Flaming Longsword"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#3D1409] text-sm mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] min-h-[80px]"
              placeholder="Describe the item..."
            />
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-1.5">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] capitalize"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-1.5">Rarity *</label>
            <select
              value={formData.rarity}
              onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] capitalize"
            >
              {rarities.map((rar) => (
                <option key={rar} value={rar} className="capitalize">{rar}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-1.5">Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
            />
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-1.5">Weight (lbs) *</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-1.5">Value (gp)</label>
            <input
              type="number"
              min="0"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-2 border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
              placeholder="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.attunement}
                onChange={(e) => setFormData({ ...formData, attunement: e.target.checked })}
                className="w-4 h-4 rounded border-[#8B6F47] bg-white/70 text-[#5C1A1A]"
              />
              <span className="text-[#3D1409] text-sm">Requires Attunement</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white/70 hover:bg-[#F0E8D5] border-2 border-[#8B6F47] text-[#3D1409] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-[#5C1A1A] hover:bg-[#4A1515] text-white rounded-lg transition-all border-2 border-[#3D1409]"
            style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.3)' }}
          >
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
        className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-xl max-w-2xl w-full flex flex-col shadow-2xl"
        style={{ boxShadow: '0 10px 25px rgba(61, 20, 9, 0.3)', maxHeight: 'min(90vh, 700px)' }}
      >
        {/* GM gets tabs to switch between template picker and custom form */}
        {isDM && (
          <div className="flex border-b-2 border-[#8B6F47]/40 bg-[#E8D5B7] rounded-t-lg overflow-hidden">
            <button
              onClick={() => setMode('pick')}
              className={
                'flex-1 py-2.5 text-sm font-medium transition-colors ' +
                (mode === 'pick'
                  ? 'bg-[#F5EFE0] text-[#3D1409] border-b-2 border-[#5C1A1A]'
                  : 'text-[#5C4A2F] hover:bg-[#F5EFE0]/50')
              }
            >
              Choose from List
            </button>
            <button
              onClick={() => setMode('custom')}
              className={
                'flex-1 py-2.5 text-sm font-medium transition-colors ' +
                (mode === 'custom'
                  ? 'bg-[#F5EFE0] text-[#3D1409] border-b-2 border-[#5C1A1A]'
                  : 'text-[#5C4A2F] hover:bg-[#F5EFE0]/50')
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
