import { store } from './store';

export const mockKV = {
  get: async <T>(key: string): Promise<T | null> => {
    return store.get<T>(key);
  },
  set: async (key: string, value: any): Promise<void> => {
    return store.set(key, value);
  }
};
