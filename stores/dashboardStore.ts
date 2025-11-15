import { create } from 'zustand';

interface DashboardState {
  selectedLeagueId: string | null;
  selectedSeason: string | null;
  syncInProgress: boolean;
  setSelectedLeague: (leagueId: string) => void;
  setSelectedSeason: (season: string) => void;
  setSyncInProgress: (inProgress: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedLeagueId: null,
  selectedSeason: null,
  syncInProgress: false,
  setSelectedLeague: (leagueId) => set({ selectedLeagueId: leagueId }),
  setSelectedSeason: (season) => set({ selectedSeason: season }),
  setSyncInProgress: (inProgress) => set({ syncInProgress: inProgress }),
}));

