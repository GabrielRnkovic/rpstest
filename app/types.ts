export interface GameState {
  id: string;
  status: 'waiting' | 'playing' | 'completed';
  player1: string | null;
  player2: string | null;
  currentTurn: 'player1' | 'player2' | null;
  choices: {
    player1?: 'rock' | 'paper' | 'scissors';
    player2?: 'rock' | 'paper' | 'scissors';
  };
  winner?: 'player1' | 'player2' | 'tie' | null;
}
