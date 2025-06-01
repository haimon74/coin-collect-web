export enum CellType {
  WALL = '🧱',
  FLOOR = '⬜️',
  COIN = '🪙',
  DIAMOND = '💎',
  PLAYER = '🧙',
}

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  grid: CellType[][];
  playerPosition: Position;
  diamondPosition: Position;
  moves: number;
  coinsCollected: number;
  totalCoins: number;
  currentLevel: number;
  coins: Position[];
  totalMoves: number;
}

export interface Level {
  grid: CellType[][];
  playerStart: Position;
  diamondStart: Position;
  totalCoins: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'; 