import { useState } from 'react';
import { Package, Plus, Users, Calendar, Trash2, LogIn, Scroll, X, Wand2, Shield, Sparkles } from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  description: string;
  playerCount: number;
  lastAccessed: string;
  createdAt: string;
}

interface HomePageProps {
  onSelectVault: (vaultId: string) => void;
  onCreateVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'lastAccessed'>) => void;
  vaults: Vault[];
  onDeleteVault: (vaultId: string) => void;
}

export function HomePage({ onSelectVault, onCreateVault, vaults, onDeleteVault }: HomePageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [userType, setUserType] = useState<'dm' | 'player'>('dm');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim() && password.trim()) {
      setShowLogin(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF] flex items-center justify-center p-4">
        <div className="bg-[#F5EFE0] border-4 border-[#3D1409] rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] rounded-2xl flex items-center justify-center mb-4 border-4 border-[#3D1409] shadow-lg">
              <Scroll className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#3D1409] text-center mb-2">Trailblazers' Vault</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#5C1A1A]/10 border-2 border-[#5C1A1A]/30 rounded-full">
              <Sparkles className="w-3 h-3 text-[#5C1A1A]" />
              <span className="text-xs font-semibold text-[#5C1A1A]">Welcome Back</span>
            </div>
          </div>

          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-[#3D1409] font-semibold mb-3 text-center">
              Login As
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType('dm')}
                className={`group p-4 rounded-xl border-4 transition-all duration-300 ${
                  userType === 'dm'
                    ? 'bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-lg scale-105'
                    : 'bg-white/50 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Wand2 className={`w-8 h-8 transition-colors ${
                    userType === 'dm' ? 'text-white' : 'text-[#5C1A1A]'
                  }`} />
                  <span className={`font-bold text-sm transition-colors ${
                    userType === 'dm' ? 'text-white' : 'text-[#3D1409]'
                  }`}>
                    Dungeon Master
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserType('player')}
                className={`group p-4 rounded-xl border-4 transition-all duration-300 ${
                  userType === 'player'
                    ? 'bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] border-[#3D1409] shadow-lg scale-105'
                    : 'bg-white/50 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Shield className={`w-8 h-8 transition-colors ${
                    userType === 'player' ? 'text-white' : 'text-[#5C1A1A]'
                  }`} />
                  <span className={`font-bold text-sm transition-colors ${
                    userType === 'player' ? 'text-white' : 'text-[#3D1409]'
                  }`}>
                    Player
                  </span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[#3D1409] font-semibold mb-2">
                {userType === 'dm' ? 'DM Name' : 'Player Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                placeholder={userType === 'dm' ? 'e.g., Dungeon Master' : 'e.g., Aragorn'}
                required
              />
            </div>

            <div>
              <label className="block text-[#3D1409] font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                placeholder={userType === 'dm' ? 'dm@example.com' : 'player@example.com'}
                required
              />
            </div>

            <div>
              <label className="block text-[#3D1409] font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all duration-300 border-4 border-[#3D1409]"
            >
              <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              <span>Enter as {userType === 'dm' ? 'DM' : 'Player'}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t-3 border-[#8B6F47]">
            <p className="text-xs text-[#5C4A2F] text-center leading-relaxed">
              {userType === 'dm' 
                ? 'Manage your party\'s inventory across multiple campaigns'
                : 'Access your character\'s inventory and shared loot'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-[#F5EFE0]/95 backdrop-blur-md border-b-4 border-[#3D1409] shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#5C1A1A] to-[#7A2424] rounded-2xl flex items-center justify-center border-4 border-[#3D1409] shadow-lg hover:rotate-6 transition-transform duration-300">
                <Scroll className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#3D1409]">Trailblazers' Vault</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#5C4A2F] font-medium">{name}</span>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[#5C1A1A] to-[#7A2424] text-white text-xs font-bold rounded-full">
                    {userType === 'dm' ? 'DM' : 'Player'}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogin(true)}
              className="group px-6 py-3 bg-white hover:bg-[#F5EFE0] border-4 border-[#8B6F47] hover:border-[#5C1A1A] text-[#3D1409] font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
            >
              <LogIn className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create New Vault Section */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full bg-[#F5EFE0] border-[4px] border-[#5C1A1A] border-dashed rounded-xl p-8 hover:bg-[#F0E8D5] transition-all shadow-md hover:shadow-lg"
            style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.15)' }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#5C1A1A] rounded-full flex items-center justify-center border-[3px] border-[#3D1409]">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-[#3D1409] mb-1">Create New Campaign Vault</h3>
                <p className="text-[#5C4A2F] text-sm">Start managing inventory for a new adventure</p>
              </div>
            </div>
          </button>
        </div>

        {/* Existing Vaults */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-[#3D1409]" />
            <h2 className="text-[#3D1409]">Your Campaign Vaults</h2>
            <span className="text-[#5C4A2F] text-sm">({vaults.length})</span>
          </div>

          {vaults.length === 0 ? (
            <div className="bg-[#F5EFE0] border-[3px] border-[#8B6F47] rounded-xl p-12 text-center">
              <Package className="w-12 h-12 text-[#8B6F47] mx-auto mb-4" />
              <h3 className="text-[#3D1409] mb-2">No vaults yet</h3>
              <p className="text-[#5C4A2F] text-sm">Create your first campaign vault to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vaults.map(vault => (
                <VaultCard
                  key={vault.id}
                  vault={vault}
                  onOpen={() => onSelectVault(vault.id)}
                  onDelete={() => onDeleteVault(vault.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Vault Modal */}
      {showCreateModal && (
        <CreateVaultModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(vault) => {
            onCreateVault(vault);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function VaultCard({ vault, onOpen, onDelete }: { vault: Vault; onOpen: () => void; onDelete: () => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className="bg-[#F5EFE0] border-[3px] border-[#8B6F47] rounded-xl p-6 hover:border-[#5C4A2F] transition-all cursor-pointer shadow-md hover:shadow-lg group"
      style={{ boxShadow: '0 2px 4px rgba(61, 20, 9, 0.15)' }}
      onClick={onOpen}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[#3D1409] truncate mb-1">{vault.name}</h3>
          <p className="text-[#5C4A2F] text-sm line-clamp-2">{vault.description}</p>
        </div>
        <button
          onClick={handleDelete}
          className={`ml-2 p-2 rounded-lg transition-all border-2 ${
            showDeleteConfirm
              ? 'bg-[#8B3A3A] text-white border-[#6B2020]'
              : 'text-[#8B6F47] hover:text-[#8B3A3A] hover:bg-[#FFEBEE] border-transparent'
          }`}
          title={showDeleteConfirm ? 'Click again to confirm' : 'Delete vault'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[#5C4A2F]">
          <Users className="w-4 h-4" />
          <span>{vault.playerCount} players</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#5C4A2F]">
          <Calendar className="w-4 h-4" />
          <span>Last accessed: {new Date(vault.lastAccessed).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t-[2px] border-[#D9C7AA]">
        <div className="text-[#5C1A1A] text-sm group-hover:text-[#3D1409] transition-colors">
          Open Vault →
        </div>
      </div>
    </div>
  );
}

function CreateVaultModal({ onClose, onCreate }: { onClose: () => void; onCreate: (vault: Omit<Vault, 'id' | 'createdAt' | 'lastAccessed'>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    playerCount: 4,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && formData.description.trim()) {
      onCreate(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#F5EFE0] border-[4px] border-[#3D1409] rounded-xl max-w-lg w-full shadow-2xl" style={{ boxShadow: '0 10px 25px rgba(61, 20, 9, 0.3)' }}>
        <div className="bg-[#F5EFE0] border-b-[4px] border-[#3D1409] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-[#3D1409]">Create New Campaign Vault</h2>
            <p className="text-[#5C4A2F] text-sm mt-1">Set up a new party inventory system</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#5C4A2F] hover:text-[#3D1409] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[#3D1409] text-sm mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
              placeholder="e.g., The Dragon's Lair Campaign"
              required
            />
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20 min-h-[100px]"
              placeholder="Brief description of your campaign..."
              required
            />
          </div>

          <div>
            <label className="block text-[#3D1409] text-sm mb-2">
              Number of Players
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.playerCount}
              onChange={(e) => setFormData({ ...formData, playerCount: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 bg-white/70 border-[3px] border-[#8B6F47] rounded-lg text-[#3D1409] focus:outline-none focus:border-[#5C4A2F] focus:ring-2 focus:ring-[#5C4A2F]/20"
            />
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
              Create Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}