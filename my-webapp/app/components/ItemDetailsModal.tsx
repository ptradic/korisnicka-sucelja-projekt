import { useState } from 'react';
import { X, Trash2, Save, Edit2, Coins, Weight } from 'lucide-react';
import type { Item, Category, Rarity } from '../types';

interface ItemDetailsModalProps {
  item: Item;
  onClose: () => void;
  onUpdate: (updates: Partial<Item>) => void;
  onDelete: () => void;
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

export function ItemDetailsModal({ item, onClose, onUpdate, onDelete }: ItemDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
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
  });

  const handleSave = () => {
    onUpdate({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      rarity: formData.rarity,
      quantity: formData.quantity,
      weight: parseFloat(formData.weight),
      value: formData.value ? parseFloat(formData.value) : undefined,
      notes: formData.notes || undefined,
      attunement: formData.attunement,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#F5EFE0] border-[4px] border-[#3D1409] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ boxShadow: '0 10px 25px rgba(61, 20, 9, 0.3)' }}>
        <div className="sticky top-0 bg-[#F5EFE0] border-b-[4px] border-[#3D1409] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
                />
              ) : (
                <h2 className="text-[#3D1409]">{item.name}</h2>
              )}
              <p className={`text-sm mt-1 capitalize ${rarityColors[item.rarity]}`}>
                {item.rarity} {item.category}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-[#8B6F47] hover:text-[#3D1409] hover:bg-[#D9C7AA] rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-[#5C4A2F] hover:text-[#3D1409] hover:bg-[#D9C7AA] rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isEditing ? (
            <>
              <div>
                <label className="block text-[#3D1409] text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#3D1409] text-sm mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="capitalize">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#3D1409] text-sm mb-2">Rarity</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value as Rarity })}
                    className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] capitalize"
                  >
                    {rarities.map(rar => (
                      <option key={rar} value={rar} className="capitalize">
                        {rar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#3D1409] text-sm mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
                  />
                </div>

                <div>
                  <label className="block text-[#3D1409] text-sm mb-2">Weight (lbs)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#3D1409] text-sm mb-2">Value (gp)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#3D1409] text-sm mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F]"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div>
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
            </>
          ) : (
            <>
              <div>
                <h3 className="text-[#5C4A2F] text-sm mb-2">Description</h3>
                <p className="text-[#3D1409]">{item.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 border-[3px] border-[#8B6F47] rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-[#5C4A2F] text-sm mb-1">
                    <Weight className="w-4 h-4" />
                    <span>Weight</span>
                  </div>
                  <p className="text-[#3D1409]">
                    {(item.weight * item.quantity).toFixed(1)} lbs
                    {item.quantity > 1 && (
                      <span className="text-[#5C4A2F] text-sm ml-1">
                        ({item.weight} × {item.quantity})
                      </span>
                    )}
                  </p>
                </div>

                {item.value && (
                  <div className="bg-white/70 border-[3px] border-[#8B6F47] rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-[#5C4A2F] text-sm mb-1">
                      <Coins className="w-4 h-4" />
                      <span>Value</span>
                    </div>
                    <p className="text-[#B8860B]">
                      {(item.value * item.quantity).toLocaleString()} gp
                      {item.quantity > 1 && (
                        <span className="text-[#5C4A2F] text-sm ml-1">
                          ({item.value} × {item.quantity})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {item.attunement && (
                <div className="bg-[#F3E5F5] border-[3px] border-[#7E57A2] rounded-lg p-3">
                  <p className="text-[#5E3A7C] text-sm">✨ Requires Attunement</p>
                </div>
              )}

              {item.notes && (
                <div>
                  <h3 className="text-[#5C4A2F] text-sm mb-2">Notes</h3>
                  <p className="text-[#3D1409] text-sm">{item.notes}</p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4 border-t-[3px] border-[#8B6F47]">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 bg-white/70 hover:bg-[#F0E8D5] border-[3px] border-[#8B6F47] text-[#3D1409] rounded-lg transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-[#5C1A1A] hover:bg-[#4A1515] text-white rounded-lg transition-all shadow-lg border-[3px] border-[#3D1409] flex items-center justify-center gap-2"
                  style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.3)' }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleDelete}
                className="w-full px-4 py-2 bg-[#FFEBEE] hover:bg-[#FFCDD2] border-[3px] border-[#8B3A3A] text-[#6B2020] rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
