'use server'

import { v4 as uuidv4 } from 'uuid';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { GameState } from './types';
import { gameStore } from '../lib/store';

export async function createGame(req, res) {
  try {
    const gameId = uuidv4();
    const newGame: GameState = {
      id: gameId,
      status: 'waiting',
      player1: 'player1',
      player2: null,
      currentTurn: null,
      choices: {},
      winner: null
    };

    await gameStore.set(`game:${gameId}`, newGame);
    
    // Set cookie for player1
    cookies().set(`game:${gameId}:player`, 'player1', { 
      path: '/',
      maxAge: 3600 // 1 hour
    });

    console.log('Game created successfully:', gameId);
    redirect(`/game/${gameId}`);
    res.status(200).json({ message: 'Game created successfully' });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function joinGame(gameId: string): Promise<'player1' | 'player2' | null> {
  const cookieStore = cookies();
  const playerRole = cookieStore.get(`game:${gameId}:player`)?.value;

  // If player already has a role for this game, return it
  if (playerRole === 'player1' || playerRole === 'player2') {
    console.log('Returning existing role from cookie:', playerRole);
    return playerRole;
  }

  const game = await gameStore.get<GameState>(`game:${gameId}`);
  if (!game) {
    console.log('Game not found');
    return null;
  }

  if (!game.player2) {
    // Join as player 2
    const updatedGame = {
      ...game,
      player2: 'player2',
      status: 'playing',
      currentTurn: 'player1'
    };
    await gameStore.set(`game:${gameId}`, updatedGame);
    
    // Set cookie for player2
    cookieStore.set(`game:${gameId}:player`, 'player2', {
      path: '/',
      maxAge: 3600 // 1 hour
    });
    
    console.log('Joined as player2');
    return 'player2';
  }

  console.log('Game full');
  return null;
}

export async function makeChoice(gameId: string, player: 'player1' | 'player2', choice: 'rock' | 'paper' | 'scissors'): Promise<void> {
  const game = await gameStore.get<GameState>(`game:${gameId}`);
  if (!game) return;

  const choices = { ...game.choices, [player]: choice };
  
  if (Object.keys(choices).length === 2) {
    // Both players have made their choices
    const winner = determineWinner(choices.player1!, choices.player2!);
    await gameStore.set(`game:${gameId}`, {
      ...game,
      choices,
      status: 'completed',
      currentTurn: null,
      winner
    });
  } else {
    // Switch turns
    await gameStore.set(`game:${gameId}`, {
      ...game,
      choices,
      currentTurn: player === 'player1' ? 'player2' : 'player1'
    });
  }
}

function determineWinner(choice1: string, choice2: string): 'player1' | 'player2' | 'tie' {
  if (choice1 === choice2) return 'tie';
  
  const wins = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return wins[choice1 as keyof typeof wins] === choice2 ? 'player1' : 'player2';
}

export async function getGameStatus(gameId: string): Promise<GameState | null> {
  const key = `game:${gameId}`;
  const game = await gameStore.get<GameState>(key);
  
  if (!game) {
    console.log('Game not found:', key);
    return null;
  }
  
  console.log('Game status:', key, game);
  return game;
}
