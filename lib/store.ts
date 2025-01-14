import { kv } from '@vercel/kv';
import { GameState } from '../app/types';

// Local storage for development
declare global {
  var gameData: Record<string, any>;
}

if (!global.gameData) {
  global.gameData = {};
}

const localStore = {
  async get<T>(key: string): Promise<T | null> {
    return global.gameData[key] || null;
  },
  async set(key: string, value: any): Promise<void> {
    global.gameData[key] = value;
  }
};

// Use Vercel KV in production, local storage in development
export const gameStore = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development' 
  ? localStore 
  : kv;
