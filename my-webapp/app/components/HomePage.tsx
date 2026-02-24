import { useState, useRef, useCallback, useEffect } from 'react';
import { Package, Plus, Users, Calendar, Trash2, X, Scroll, Shield, ChevronRight, LogIn, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface Vault {
  id: string;
  name: string;
  description: string;
  playerCount: number;
  password: string;
  lastAccessed: string;
  createdAt: string;
}

interface HomePageProps {
  onSelectVault: (vaultId: string) => void;
  onCreateVault: (vault: Omit<Vault, 'id' | 'createdAt' | 'lastAccessed'>) => void;
  onJoinVault: (campaignId: string, password: string) => Promise<boolean>;
  vaults: Vault[];
  onDeleteVault: (vaultId: string) => void;
  userType: string;
}

export function HomePage({ onSelectVault, onCreateVault, onJoinVault, vaults, onDeleteVault, userType }: HomePageProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const isDM = userType === 'dm';

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8D5B7] via-[#DCC8A8] to-[#E0CFAF]">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-32">
        {/* Create / Join Vault Section */}
        <div className="mb-8">
          {isDM ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-[#F5EFE0] border-4 border-[#8B6F47] border-dashed rounded-xl p-8 hover:bg-[#F0E8D5] hover:border-[#5C1A1A] transition-all duration-300 shadow-md hover:shadow-lg group"
              style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.15)' }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#8B6F47] group-hover:bg-[#5C1A1A] rounded-full flex items-center justify-center border-[3px] border-[#6B5535] group-hover:border-[#3D1409] transition-colors duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-[#3D1409] mb-1">Create New Campaign Vault</h3>
                  <p className="text-[#5C4A2F] text-sm">Start managing inventory for a new adventure</p>
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="w-full bg-[#F5EFE0] border-4 border-[#8B6F47] border-dashed rounded-xl p-8 hover:bg-[#F0E8D5] hover:border-[#5C1A1A] transition-all duration-300 shadow-md hover:shadow-lg group"
              style={{ boxShadow: '0 4px 6px -1px rgba(61, 20, 9, 0.15)' }}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#8B6F47] group-hover:bg-[#5C1A1A] rounded-full flex items-center justify-center border-[3px] border-[#6B5535] group-hover:border-[#3D1409] transition-colors duration-300">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-[#3D1409] mb-1">Join Campaign Vault</h3>
                  <p className="text-[#5C4A2F] text-sm">Enter a vault name and password to join your party</p>
                </div>
              </div>
            </button>
          )}
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

      {/* Join Vault Modal */}
      {showJoinModal && (
        <JoinVaultModal
          onClose={() => setShowJoinModal(false)}
          onJoin={onJoinVault}
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

      <div className="mt-4 pt-4 border-t-2 border-[#D9C7AA]">
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
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Textarea ref & resize/scrollbar state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const [showScrollbar, setShowScrollbar] = useState(false);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const isScrollDragging = useRef(false);
  const scrollDragStartY = useRef(0);
  const scrollDragStartTop = useRef(0);

  const updateScrollbar = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const hasScroll = scrollHeight > clientHeight;
    setShowScrollbar(hasScroll);
    if (!hasScroll) return;
    const trackPad = 6;
    const trackH = clientHeight - trackPad * 2;
    const ratio = clientHeight / scrollHeight;
    const tHeight = Math.max(24, trackH * ratio);
    const maxTop = trackH - tHeight;
    const tTop = maxTop * (scrollTop / (scrollHeight - clientHeight));
    setThumbHeight(tHeight);
    setThumbTop(tTop);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const handler = () => updateScrollbar();
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
  }, [updateScrollbar]);

  const handleScrollThumbDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isScrollDragging.current = true;
    scrollDragStartY.current = e.clientY;
    scrollDragStartTop.current = thumbTop;

    const handleMove = (ev: MouseEvent) => {
      if (!isScrollDragging.current || !textareaRef.current) return;
      const el = textareaRef.current;
      const trackPad = 6;
      const trackH = el.clientHeight - trackPad * 2;
      const delta = ev.clientY - scrollDragStartY.current;
      const ratio = el.clientHeight / el.scrollHeight;
      const tHeight = Math.max(24, trackH * ratio);
      const maxTop = trackH - tHeight;
      const newTop = Math.min(maxTop, Math.max(0, scrollDragStartTop.current + delta));
      const scrollRatio = newTop / maxTop;
      el.scrollTop = scrollRatio * (el.scrollHeight - el.clientHeight);
    };

    const handleUp = () => {
      isScrollDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [thumbTop]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!scrollTrackRef.current || !textareaRef.current) return;
    const rect = scrollTrackRef.current.getBoundingClientRect();
    const trackPad = 6;
    const clickY = e.clientY - rect.top - trackPad;
    const el = textareaRef.current;
    const trackH = el.clientHeight - trackPad * 2;
    const ratio = el.clientHeight / el.scrollHeight;
    const tHeight = Math.max(24, trackH * ratio);
    const maxTop = trackH - tHeight;
    const newTop = Math.min(maxTop, Math.max(0, clickY - tHeight / 2));
    const scrollRatio = newTop / maxTop;
    el.scrollTop = scrollRatio * (el.scrollHeight - el.clientHeight);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startHeight.current = textareaRef.current?.offsetHeight || 120;

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !textareaRef.current) return;
      const currentY = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const delta = currentY - startY.current;
      const newHeight = Math.max(60, startHeight.current + delta);
      textareaRef.current.style.height = `${newHeight}px`;
      updateScrollbar();
    };

    const handleEnd = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  }, [updateScrollbar]);

  const mouseDownTarget = useRef<EventTarget | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const description = textareaRef.current?.value || '';
    if (formData.name.trim() && formData.password.trim()) {
      onCreate({ ...formData, description });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50"
      onMouseDown={(e) => { mouseDownTarget.current = e.target; }}
      onMouseUp={(e) => { if (e.target === e.currentTarget && mouseDownTarget.current === e.currentTarget) onClose(); mouseDownTarget.current = null; }}
    >
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-lg w-full flex flex-col shadow-2xl transform transition-all"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)', maxHeight: 'calc(100vh - 1rem)', maxWidth: '32rem' }}
      >
        {/* Header */}
        <div className="p-3 sm:p-5 pb-2 sm:pb-3 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md">
              <Scroll className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Create New Vault</h2>
              <p className="text-[#5C4A2F] text-sm mt-0.5">Set up a new party inventory system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 sm:mx-5 border-t-2 border-[#DCC8A8] shrink-0" />

        <form onSubmit={handleSubmit} className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 min-h-0">
          {/* Campaign Name */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">
              Campaign Name <span className="text-[#8B3A3A]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
              placeholder="e.g., The Dragon's Lair Campaign"
              required
            />
          </div>

          {/* Player Count */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">
              Number of Players
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, playerCount: Math.max(1, formData.playerCount - 1) })}
                className="w-9 h-9 rounded-xl bg-white/70 border-3 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white text-[#3D1409] font-bold text-lg flex items-center justify-center transition-all duration-200 active:scale-95"
              >
                −
              </button>
              <div className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-white/40 backdrop-blur-sm border-2 border-[#DCC8A8] rounded-2xl shadow-sm">
                <Users className="w-4 h-4 text-[#8B6F47]" />
                <span className="text-[#3D1409] font-bold text-xl tabular-nums">{formData.playerCount}</span>
                <span className="text-[#5C4A2F] text-sm font-medium">player{formData.playerCount !== 1 ? 's' : ''}</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, playerCount: Math.min(10, formData.playerCount + 1) })}
                className="w-9 h-9 rounded-xl bg-white/70 border-3 border-[#8B6F47] hover:border-[#5C1A1A] hover:bg-white text-[#3D1409] font-bold text-lg flex items-center justify-center transition-all duration-200 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Vault Password */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">
              Vault Password <span className="text-[#8B3A3A]">*</span>
            </label>
            <p className="text-[#5C4A2F] text-xs mb-1">Share this password with your players so they can join</p>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F47]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                placeholder="Enter a password for this vault"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-1">
              Description
            </label>
            <div className="relative">
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  onInput={() => {
                    const el = textareaRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                    updateScrollbar();
                  }}
                  onKeyUp={() => {
                    const el = textareaRef.current;
                    if (el) el.scrollTop = el.scrollHeight;
                    updateScrollbar();
                  }}
                  className="w-full px-4 py-3 pr-8 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-[border-color,box-shadow] duration-300 custom-scrollbar resize-none"
                  style={{ height: '88px' }}
                  placeholder="Brief description of your campaign..."
                />
                {/* Custom scrollbar overlay */}
                {showScrollbar && (
                  <div
                    ref={scrollTrackRef}
                    onClick={handleTrackClick}
                    className="absolute top-[3px] right-1.5 bottom-[3px] w-3.5 flex items-stretch cursor-pointer"
                  >
                    {/* Thin center rail */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1.5 bottom-[11px] w-0.5 rounded-full bg-[#DCC8A8]" />
                    {/* Thick draggable thumb */}
                    <div
                      onMouseDown={handleScrollThumbDown}
                      className="absolute left-1/2 -translate-x-1/2 w-2.5 rounded-full bg-[#8B6F47] hover:bg-[#5C1A1A] transition-colors duration-200 cursor-grab active:cursor-grabbing"
                      style={{
                        top: `${thumbTop + 6}px`,
                        height: `${thumbHeight}px`,
                      }}
                    />
                  </div>
                )}
              </div>
              {/* Custom resize handle — diagonal grip lines */}
              <div
                onMouseDown={handleResizeStart}
                onTouchStart={handleResizeStart}
                className="flex items-center justify-center py-1 cursor-ns-resize select-none group/handle"
              >
                <svg width="20" height="10" viewBox="0 0 20 10" className="text-[#8B6F47] group-hover/handle:text-[#5C1A1A] transition-colors duration-200">
                  <line x1="4" y1="2" x2="16" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-[#DCC8A8] shrink-0" />

          {/* Button */}
          <div className="shrink-0">
            <button
              type="submit"
              className="group w-full px-6 py-2 sm:py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-4 border-[#3D1409] flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Create Vault
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinVaultModal({ onClose, onJoin }: { onClose: () => void; onJoin: (campaignId: string, password: string) => Promise<boolean> }) {
  const [campaignId, setCampaignId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!campaignId.trim() || !password.trim()) return;
    
    setIsLoading(true);
    const joined = await onJoin(campaignId.trim().toUpperCase(), password.trim());
    setIsLoading(false);
    
    if (joined) {
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } else {
      setError('Campaign not found or incorrect password. Please check the Campaign ID and try again.');
    }
  };

  const joinMouseDownTarget = useRef<EventTarget | null>(null);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onMouseDown={(e) => { joinMouseDownTarget.current = e.target; }}
      onMouseUp={(e) => { if (e.target === e.currentTarget && joinMouseDownTarget.current === e.currentTarget) onClose(); joinMouseDownTarget.current = null; }}
    >
      <div
        className="bg-linear-to-br from-[#F5EFE0] to-[#E8D5B7] border-4 border-[#8B6F47] rounded-2xl max-w-lg w-full shadow-2xl transform transition-all"
        style={{ boxShadow: '0 20px 50px rgba(61, 20, 9, 0.35)' }}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-[#8B6F47] to-[#A0845A] rounded-xl flex items-center justify-center shadow-md">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#3D1409]" style={{ fontFamily: 'var(--font-archivo-black)' }}>Join Campaign</h2>
              <p className="text-[#5C4A2F] text-sm mt-0.5">Enter the campaign ID and password from your DM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B6F47] hover:text-[#3D1409] hover:bg-white/50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t-2 border-[#DCC8A8]" />

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Campaign ID */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-2">
              Campaign ID <span className="text-[#8B3A3A]">*</span>
            </label>
            <p className="text-[#5C4A2F] text-xs mb-2">Ask your DM for the 8-character campaign code</p>
            <div className="relative">
              <Scroll className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F47]" />
              <input
                type="text"
                value={campaignId}
                onChange={(e) => { setCampaignId(e.target.value.toUpperCase()); setError(''); }}
                className="w-full pl-10 pr-4 py-3 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300 font-mono text-lg tracking-wider"
                placeholder="ABC12345"
                maxLength={8}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#3D1409] font-semibold text-sm mb-2">
              Password <span className="text-[#8B3A3A]">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B6F47]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full pl-10 pr-12 py-3 bg-white/70 border-3 border-[#8B6F47] rounded-xl text-[#3D1409] placeholder:text-[#8B6F47]/50 focus:outline-none focus:border-[#5C1A1A] focus:ring-2 focus:ring-[#5C1A1A]/20 transition-all duration-300"
                placeholder="Enter the campaign password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6F47] hover:text-[#5C1A1A] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-[#8B3A3A]/10 border-2 border-[#8B3A3A]/30 rounded-xl">
              <AlertCircle className="w-4 h-4 text-[#8B3A3A] shrink-0" />
              <span className="text-sm text-[#8B3A3A] font-medium">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-600/10 border-2 border-green-600/30 rounded-xl">
              <Shield className="w-4 h-4 text-green-700 shrink-0" />
              <span className="text-sm text-green-700 font-medium">Successfully joined the campaign!</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t-2 border-[#DCC8A8]" />

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={success || isLoading}
              className="group w-full px-6 py-3 rounded-xl bg-linear-to-r from-[#5C1A1A] to-[#7A2424] hover:from-[#4A1515] hover:to-[#5C1A1A] text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300 border-4 border-[#3D1409] flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  Join Campaign
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}