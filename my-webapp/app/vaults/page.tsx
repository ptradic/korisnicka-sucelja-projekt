"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVaultAuth } from './VaultAuthProvider';
import { VaultLobby } from '@/app/components/VaultLobby';
import { CampaignIdModal } from '@/app/components/CampaignIdModal';
import { VaultListSkeleton } from '@/app/components/skeletons/SkeletonLoader';
import { VaultsTutorial } from '@/app/components/VaultsTutorial';
import {
  updateUserRole,
  getUserCampaigns,
  getCampaign,
  createCampaign,
  joinCampaign,
  deleteCampaign,
  leaveCampaign,
} from '@/src/firebaseService';
import type { CampaignDoc } from '@/src/firebaseService';

export default function VaultsLobbyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    userId, userName, userRole, setUserRole,
    isAuthenticated, isLoading,
    trackWrite, showActionError,
  } = useVaultAuth();

  const [campaigns, setCampaigns] = useState<CampaignDoc[]>([]);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState(true);
  const [newCampaignId, setNewCampaignId] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial when ?tutorial=true is in the URL
  useEffect(() => {
    if (searchParams.get('tutorial') === 'true' && !isLoading && !isCampaignsLoading) {
      setShowTutorial(true);
      // Clean up the URL
      router.replace('/vaults', { scroll: false });
    }
  }, [searchParams, isLoading, isCampaignsLoading, router]);

  // Load campaigns for current role
  useEffect(() => {
    if (!userId) return;

    const loadCampaigns = async () => {
      setIsCampaignsLoading(true);
      try {
        const userCampaigns = await getUserCampaigns(userId, userRole);
        setCampaigns(userCampaigns);
      } catch (error) {
        console.error('Failed to load campaigns:', error);
        showActionError('Could not load vaults', error, () => loadCampaigns());
      } finally {
        setIsCampaignsLoading(false);
      }
    };

    void loadCampaigns();
  }, [userId, userRole, showActionError]);

  const handleRoleSwitch = async (nextRole: 'gm' | 'player') => {
    if (!userId || nextRole === userRole) return;

    try {
      await trackWrite(() => updateUserRole(userId, nextRole));
      setUserRole(nextRole);
      setCampaigns([]);
      setIsCampaignsLoading(true);
    } catch (error) {
      console.error('Failed to update role:', error);
      showActionError('Could not switch role', error, () => handleRoleSwitch(nextRole));
    }
  };

  const handleSelectCampaign = (campaignId: string) => {
    router.push(`/vaults/${campaignId}`);
  };

  const handleCreateCampaign = async (info: { name: string; description: string; password: string }) => {
    if (!userId) return;

    try {
      const campaignId = await trackWrite(() => createCampaign(userId, userName, info.name, info.description, info.password));
      const newCampaign = await getCampaign(campaignId);
      if (newCampaign) {
        setCampaigns([...campaigns, newCampaign]);
        setNewCampaignId(campaignId);
        setNewCampaignName(info.name);
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      showActionError('Could not create vault', error, () => handleCreateCampaign(info));
    }
  };

  const handleJoinCampaign = async (campaignId: string, password: string, characterName: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      await trackWrite(() => joinCampaign(campaignId, userId, characterName, password));
      const campaign = await getCampaign(campaignId);
      if (campaign) {
        setCampaigns([...campaigns, campaign]);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to join campaign:', error);
      showActionError('Could not join vault', error, async () => { await handleJoinCampaign(campaignId, password, characterName); });
      return false;
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!userId) return;
    try {
      await trackWrite(() => deleteCampaign(campaignId, userId));
      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      showActionError('Could not delete vault', error, () => handleDeleteCampaign(campaignId));
    }
  };

  const handleLeaveCampaign = async (campaignId: string) => {
    if (!userId) return;
    try {
      await trackWrite(() => leaveCampaign(campaignId, userId));
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (error) {
      console.error('Failed to leave campaign:', error);
      showActionError('Could not leave vault', error, () => handleLeaveCampaign(campaignId), 'Try leaving again');
    }
  };

  if (isLoading || isCampaignsLoading) {
    return <VaultListSkeleton />;
  }

  if (!isAuthenticated) return null;

  const vaults = campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    playerCount: c.playerIds.length,
    password: c.password || '',
    lastAccessed: c.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
    createdAt: c.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
  }));

  const tabBaseClass = 'flex-1 text-sm py-3 font-bold border-0 shadow-none transition-all duration-200';
  const tabActiveClass = 'bg-[#F5EDE0]/20 text-[#F5EDE0] backdrop-blur-sm shadow-lg';
  const tabInactiveClass = 'bg-white/5 text-[#F5EDE0]/60 hover:bg-white/10 hover:text-[#F5EDE0]/90';

  return (
    <>
      <VaultLobby
        vaults={vaults}
        userType={userRole === 'gm' ? 'gm' : 'player'}
        onSelectVault={handleSelectCampaign}
        onCreateVault={handleCreateCampaign}
        onJoinVault={handleJoinCampaign}
        onDeleteVault={handleDeleteCampaign}
        onLeaveVault={handleLeaveCampaign}
        topContent={(
          <div className="px-6 pt-8" data-tutorial="role-tabs">
            <div className="max-w-7xl mx-auto">
              <div className="flex w-full border-b-2 border-[#F5EDE0]/15 bg-white/5 backdrop-blur-sm overflow-hidden rounded-xl">
                <button
                  onClick={() => void handleRoleSwitch('player')}
                  className={
                    tabBaseClass + ' ' + (userRole === 'player' ? tabActiveClass : tabInactiveClass)
                  }
                >
                  Player
                </button>
                <button
                  onClick={() => void handleRoleSwitch('gm')}
                  className={
                    tabBaseClass + ' ' + (userRole === 'gm' ? tabActiveClass : tabInactiveClass)
                  }
                >
                  Game Master
                </button>
              </div>
            </div>
          </div>
        )}
      />
      {newCampaignId && (
        <CampaignIdModal
          campaignId={newCampaignId}
          campaignName={newCampaignName}
          onClose={() => {
            setNewCampaignId(null);
            setNewCampaignName('');
          }}
        />
      )}
      {showTutorial && (
        <VaultsTutorial onComplete={() => setShowTutorial(false)} />
      )}
    </>
  );
}
