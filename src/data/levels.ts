import { CellType, Level, Position } from '../types/game';

interface ParsedLevel extends Level {
  coins: Position[];
}

const parseLevel = (levelString: string): ParsedLevel => {
  console.log('Parsing level string:', levelString);
  const rows = levelString.trim().split('\n');
  const grid: CellType[][] = [];
  let playerStart = { row: 0, col: 0 };
  let diamondStart = { row: 0, col: 0 };
  let coins: Position[] = [];

  console.log('Parsing rows:', rows.length);

  rows.forEach((row, rowIndex) => {
    // Use Unicode-aware regex to split into full emoji cells
    const cells = row.match(/(🧱|⬜️|🪙|💎|🧙)/g) || [];
    grid[rowIndex] = [];
    cells.forEach((cell, colIndex) => {
      switch (cell) {
        case CellType.PLAYER:
          console.log('Found player at:', { row: rowIndex, col: colIndex });
          playerStart = { row: rowIndex, col: colIndex };
          grid[rowIndex][colIndex] = CellType.FLOOR;
          break;
        case CellType.DIAMOND:
          console.log('Found diamond at:', { row: rowIndex, col: colIndex });
          diamondStart = { row: rowIndex, col: colIndex };
          grid[rowIndex][colIndex] = CellType.FLOOR;
          break;
        case CellType.COIN:
          console.log('Found coin at:', { row: rowIndex, col: colIndex });
          coins.push({ row: rowIndex, col: colIndex });
          grid[rowIndex][colIndex] = CellType.FLOOR;
          break;
        case CellType.WALL:
          grid[rowIndex][colIndex] = CellType.WALL;
          break;
        case CellType.FLOOR:
          grid[rowIndex][colIndex] = CellType.FLOOR;
          break;
        default:
          grid[rowIndex][colIndex] = cell as CellType;
      }
    });
  });

  console.log('Level parsing complete:', {
    totalCoins: coins.length,
    playerStart,
    diamondStart,
    gridSize: `${grid.length}x${grid[0].length}`
  });

  return { grid, playerStart, diamondStart, totalCoins: coins.length, coins };
};

// Verify level data before export
const verifyLevels = (levels: ParsedLevel[]): ParsedLevel[] => {
  console.log('Verifying levels...');
  levels.forEach((level, index) => {
    console.log(`Level ${index + 1}:`, {
      totalCoins: level.totalCoins,
      playerStart: level.playerStart,
      diamondStart: level.diamondStart,
      gridSize: `${level.grid.length}x${level.grid[0].length}`
    });
  });
  return levels;
};

const levelData: ParsedLevel[] = [
  parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱🧱⬜️⬜️⬜️🧱🪙⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️🧱🧱🧱⬜️⬜️⬜️⬜️🧱
🧱⬜️🧱⬜️🪙🧱⬜️⬜️🧱🪙⬜️🧱
🧱🧱🧱🧱⬜️⬜️⬜️🧱🧱🧱🧱🧱
🧱⬜️🧱🪙⬜️⬜️⬜️⬜️🧱🪙⬜️🧱
🧱⬜️⬜️⬜️🧙⬜️💎⬜️⬜️🪙⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
  parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱🪙🧱
🧱⬜️⬜️⬜️⬜️🪙⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱🧱🪙🧱⬜️🧱⬜️⬜️🧱⬜️🧱🧱
🧱⬜️🧱🪙🧱⬜️⬜️🧱🪙🧱⬜️🧱
🧱⬜️⬜️⬜️🧙⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️🧱⬜️⬜️💎⬜️🧱⬜️⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
  parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱⬜️🧱
🧱⬜️⬜️🧱🧱⬜️⬜️⬜️🧱🧱⬜️🧱
🧱⬜️🪙🧱🪙⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️⬜️🧱🧱⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️⬜️🪙🧱⬜️🪙⬜️🧱
🧱⬜️🧱🪙⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️🧱🧱🧙🧱💎⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱🧱
🧱⬜️🧱⬜️⬜️⬜️⬜️⬜️🪙⬜️🧱🧱
🧱⬜️🧱🧱⬜️⬜️🪙⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️🧱🪙⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️🧱⬜️⬜️⬜️🧱🧱🧱⬜️🧱
🧱⬜️🪙⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️🧙⬜️💎⬜️⬜️🪙⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🧱🧱🧱⬜️⬜️⬜️⬜️⬜️⬜️🧱🧱
🧱🧱🧱⬜️⬜️🧱🪙🧱⬜️⬜️🧱🧱
🧱🧱⬜️⬜️⬜️🪙🧱🪙⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️🧱🪙🧱🪙⬜️⬜️🧱
🧱⬜️⬜️⬜️🧱⬜️⬜️⬜️🧱⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱🧱
🧱🧙⬜️⬜️⬜️⬜️💎⬜️⬜️🧱🧱🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️🧱🧱⬜⬜⬜️🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️🧱🪙🧱⬜️🧱
🧱⬜️🧱⬜️🧱⬜⬜️🪙🧱⬜️⬜️🧱
🧱⬜️🪙🧱🪙⬜️⬜️🧱🪙🧱⬜️🧱
🧱⬜️🧱⬜️🧱⬜⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️🧙⬜️💎⬜️⬜️🧱⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱🧱🧱🧱🧱⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🧱⬜️⬜️⬜️⬜️⬜️⬜️🧱🧱
🧱🧱🧱🪙⬜️🧱🪙⬜️⬜️⬜️⬜️🧱
🧱🧱🪙⬜️🧱🧱🧱⬜️⬜️🪙🧱🧱
🧱⬜️⬜️⬜️⬜️🧱⬜️⬜️🪙🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱🧱🧱🧱
🧱⬜️⬜️⬜️🧙⬜️💎🧱🧱🧱🧱🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️🧱🪙⬜️⬜️🧱🧱⬜️⬜️🧱
🧱⬜️⬜️🧱🧱🧱⬜️🪙🧱🪙⬜️🧱
🧱⬜️⬜️⬜️⬜️🧱⬜️⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🧱⬜️🪙⬜️⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🪙⬜️⬜️🧱🧱🧱⬜️⬜️🧱
🧱⬜️⬜️⬜️🧙⬜️💎⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱🧱
🧱⬜️🧱🧱🪙⬜️⬜️🧱🧱⬜️🧱🧱
🧱⬜️🧱⬜️🧱⬜️🧱🪙⬜️⬜️⬜️🧱
🧱⬜️🧱⬜️🧱⬜️🪙🧱🪙⬜️⬜️🧱
🧱⬜️🧱⬜️🧱⬜️⬜️🪙🧱⬜️⬜️🧱
🧱⬜️🧱🧱⬜️⬜️🧱🧱⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️🧙⬜️💎⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`),
parseLevel(`
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱
🧱⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️🧱
🧱⬜️⬜️🧱⬜️⬜️🧱🧱⬜️⬜️⬜️🧱
🧱⬜️🧱⬜️🧱⬜️⬜️🪙🧱⬜️⬜️🧱
🧱⬜️🪙🧱🪙⬜️⬜️🧱🪙⬜️⬜️🧱
🧱⬜️🧱⬜️🧱⬜️⬜️🪙🧱⬜️⬜️🧱
🧱⬜️⬜️🧱⬜️⬜️🧱🧱⬜️⬜️⬜️🧱
🧱⬜️⬜️⬜️⬜️🧙💎⬜️⬜️⬜️⬜️🧱
🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱`)
];

export const levels: ParsedLevel[] = verifyLevels(levelData); 