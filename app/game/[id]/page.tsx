'use client'

import React from 'react';
import { useEffect, useState } from 'react';
import { makeChoice, getGameStatus, joinGame } from '../../actions';
import { GameState } from '../../types';

export default function GameRoom({ params }: { params: { id: string } }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerNumber, setPlayerNumber] = useState<'player1' | 'player2' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 10;

    const setupGame = async () => {
      try {
        console.log('Setting up game...');
        const joinedAs = await joinGame(params.id);
        console.log('Join result:', joinedAs);
        
        if (!mounted) return;

        if (joinedAs) {
          setPlayerNumber(joinedAs);
          setError(null);
        } else if (attempts >= maxAttempts) {
          setError('Game not found or full');
        }
      } catch (e) {
        console.error('Setup error:', e);
        if (mounted && attempts >= maxAttempts) {
          setError('Failed to join game');
        }
      }
    };

    const interval = setInterval(() => {
      if (attempts < maxAttempts && !playerNumber) {
        attempts++;
        setupGame();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    setupGame();
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [params.id, playerNumber]);

  useEffect(() => {
    const checkGame = async () => {
      try {
        const status = await getGameStatus(params.id);
        if (status) {
          setGameState(status);
          setError(null);
        } else {
          setError('Game not found');
        }
      } catch (e) {
        setError(`Failed to fetch game status: ${e}`);
      }
    };

    checkGame();
    const interval = setInterval(checkGame, 1000);
    return () => clearInterval(interval);
  }, [params.id]);

  const makeMove = async (choice: 'rock' | 'paper' | 'scissors') => {
    if (!playerNumber || !gameState) return;
    
    // Only allow moves on player's turn
    if (gameState.currentTurn !== playerNumber) {
      setError("It's not your turn!");
      return;
    }

    try {
      await makeChoice(params.id, playerNumber, choice);
    } catch (e) {
      setError('Failed to make move');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (!gameState || !playerNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl mb-4">Loading game...</h2>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }

  const isMyTurn = gameState.currentTurn === playerNumber;
  const shareUrl = `${window.location.origin}/game/${params.id}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Game Room</h1>
      
      {/* Add debug info */}
      <div className="text-sm text-gray-500 mb-4">
        Game ID: {params.id}<br />
        Your Role: {playerNumber || 'Not assigned'}<br />
        Game Status: {gameState?.status || 'Unknown'}<br />
        Player 2: {gameState?.player2 ? 'Joined' : 'Waiting'}
      </div>
      
      {gameState.player2 === null ? (
        <div className="mb-4 space-y-4">
          <p>Waiting for player 2 to join...</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="p-2 border rounded w-full"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={copyToClipboard}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="font-bold">You are {playerNumber === 'player1' ? 'Player 1' : 'Player 2'}</p>
          <p className="text-lg mt-2">
            {isMyTurn 
              ? "It's your turn!" 
              : `Waiting for ${playerNumber === 'player1' ? 'Player 2' : 'Player 1'}'s move...`
            }
          </p>
        </div>
      )}
      
      {gameState.status === 'completed' ? (
        <div className="text-xl">
          {gameState.winner === 'tie' 
            ? "It's a tie!"
            : gameState.winner === playerNumber 
              ? 'You won!'
              : 'You lost!'}
          <div>
            Results: Player 1 chose {gameState.choices.player1}, Player 2 chose {gameState.choices.player2}
          </div>
        </div>
      ) : isMyTurn && (
        <div className="flex gap-4">
          <button
            onClick={() => makeMove('rock')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Rock
          </button>
          <button
            onClick={() => makeMove('paper')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Paper
          </button>
          <button
            onClick={() => makeMove('scissors')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Scissors
          </button>
        </div>
      )}
    </div>
  );
}
