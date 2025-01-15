'use client';

import React from 'react';
import { createGame } from './actions';

export default function Home() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/create-game', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Game created:', data);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Rock Paper Scissors</h1>
      <form onSubmit={handleSubmit}>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Create New Game
        </button>
      </form>
    </main>
  );
}
