import { create } from 'zustand';

export const useAppStore = create((set) => ({
  balls: [],
  setBalls: (updater) => set(state => ({ balls: typeof updater === 'function' ? updater(state.balls) : updater })),

  poppingIds: new Set(),
  startPop: (id) => set(state => ({ poppingIds: new Set([...state.poppingIds, id]) })),
  endPop: (id) => set(state => {
    const s = new Set(state.poppingIds);
    s.delete(id);
    return { poppingIds: s, balls: state.balls.filter(b => b.id !== id) };
  }),

  selectedTaskId: null,
  setSelectedTask: (id) => set({ selectedTaskId: id }),
}));
