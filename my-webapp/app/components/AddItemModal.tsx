import { useState } from 'react';
import { X } from 'lucide-react';
import type { Item, Category, Rarity } from '../types';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
  targetName: string;
}

const categories: Category[] = ['weapon', 'armor', 'potion', 'magic', 'treasure', 'misc'];
const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'very rare', 'legendary', 'artifact'];

export function AddItemModal({ onClose, onAdd, targetName }: AddItemModalProps) {
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
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.weight) {
      return;
    }

    onAdd({
      name: formData.name,
      description: formData.description,
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#F5EFE0] border-[4px] border-[#3D1409] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ boxShadow: '0 10px 25px rgba(61, 20, 9, 0.3)' }}>
        <div className="sticky top-0 bg-[#F5EFE0] border-b-[4px] border-[#3D1409] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-[#3D1409]">Give Item to {targetName}</h2>
            <p className="text-[#5C4A2F] text-sm mt-1">Add a new item to this inventory</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5C4A2F] hover:text-[#3D1409] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[#3D1409] text-sm mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
                placeholder="e.g., Flaming Longsword"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#3D1409] text-sm mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20 min-h-[100px]"
                placeholder="Describe the item..."
                required
              />
            </div>

            <div>
              <label className="block text-[#3D1409] text-sm mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20 capitalize"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#3D1409] text-sm mb-2">
                Rarity *
              </label>
              <select
                value={formData.rarity}
                onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20 capitalize"
              >
                {rarities.map(rar => (
                  <option key={rar} value={rar} className="capitalize">
                    {rar}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#3D1409] text-sm mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
              />
            </div>

            <div>
              <label className="block text-[#3D1409] text-sm mb-2">
                Weight (lbs) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
                placeholder="0.0"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#3D1409] text-sm mb-2">
                Value (gp)
              </label>
              <input
                type="number"
                min="0"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#3D1409] text-sm mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.attunement}
                  onChange={(e) => setFormData({ ...formData, attunement: e.target.checked })}
                  className="w-4 h-4 rounded border-[#8B6F47] bg-white/70 text-[#5C1A1A] focus:ring-2 focus:ring-[#5C4A2F]/20"
                />
                <span className="text-[#3D1409] text-sm">Requires Attunement</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/70 hover:bg-[#F0E8D5] border-[3px] border-[#8B6F47] text-[#3D1409] rounded-lg transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#5C1A1A] hover:bg-[#4A1515] text-white rounded-lg transition-all shadow-lg border-[3px] border-[#3D1409]"
              style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.3)' }}
            >
              Give Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
