import React from 'react';
import { createGame } from './actions';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">Rock Paper Scissors</h1>
      <form action={createGame}>
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
