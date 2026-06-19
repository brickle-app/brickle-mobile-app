import { create } from 'zustand';

interface RefreshStore {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const refreshStore = create<RefreshStore>((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
}));