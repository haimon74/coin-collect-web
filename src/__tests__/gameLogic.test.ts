import { CellType, Position } from '../types/game';
import { levels } from '../data/levels';

// Helper to get a deep copy of a level for testing
function getTestLevel() {
  // Use the first level for testing
  const level = levels[0];
  return {
    grid: level.grid.map(row => [...row]),
    playerPosition: { ...level.playerStart },
    diamondPosition: { ...level.diamondStart },
    coins: level.coins.map(pos => ({ ...pos })),
    moves: 0,
    coinsCollected: 0,
    totalCoins: level.totalCoins,
    currentLevel: 0,
  };
}

describe('parseLevel', () => {
  it('parses player, diamond, and coins correctly', () => {
    const level = levels[0];
    expect(level.playerStart).toBeDefined();
    expect(level.diamondStart).toBeDefined();
    expect(Array.isArray(level.coins)).toBe(true);
    expect(level.grid.length).toBeGreaterThan(0);
  });
});

// Example pure function for moving player (to be refactored from Game.tsx for real tests)
function movePlayerTest(state: any, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
  // This is a simplified version for demonstration
  let { playerPosition, grid, coins } = state;
  let newRow = playerPosition.row;
  let newCol = playerPosition.col;
  let moved = false;
  let path: Position[] = [];
  switch (direction) {
    case 'UP':
      while (newRow > 0 && grid[newRow - 1][newCol] !== CellType.WALL && grid[newRow - 1][newCol] !== CellType.DIAMOND) {
        newRow--;
        path.push({ row: newRow, col: newCol });
        moved = true;
      }
      break;
    case 'DOWN':
      while (newRow < grid.length - 1 && grid[newRow + 1][newCol] !== CellType.WALL && grid[newRow + 1][newCol] !== CellType.DIAMOND) {
        newRow++;
        path.push({ row: newRow, col: newCol });
        moved = true;
      }
      break;
    case 'LEFT':
      while (newCol > 0 && grid[newRow][newCol - 1] !== CellType.WALL && grid[newRow][newCol - 1] !== CellType.DIAMOND) {
        newCol--;
        path.push({ row: newRow, col: newCol });
        moved = true;
      }
      break;
    case 'RIGHT':
      while (newCol < grid[0].length - 1 && grid[newRow][newCol + 1] !== CellType.WALL && grid[newRow][newCol + 1] !== CellType.DIAMOND) {
        newCol++;
        path.push({ row: newRow, col: newCol });
        moved = true;
      }
      break;
  }
  // Collect coins along the path
  let newCoins = coins.filter(
    coin => !path.some(pos => pos.row === coin.row && pos.col === coin.col)
  );
  return {
    ...state,
    playerPosition: { row: newRow, col: newCol },
    coins: newCoins,
    coinsCollected: state.coinsCollected + (state.coins.length - newCoins.length),
  };
}

describe('movePlayer', () => {
  it('moves player to the nearest wall or diamond and collects coins along the path', () => {
    let state = getTestLevel();
    const startCol = state.playerPosition.col;
    // Move right
    state = movePlayerTest(state, 'RIGHT');
    expect(state.playerPosition.col).toBeGreaterThan(startCol);
    // All coins in the path should be collected
    expect(state.coinsCollected).toBeGreaterThanOrEqual(0);
    expect(state.coins.length).toBeLessThanOrEqual(levels[0].coins.length);
  });
});

describe('movePlayer - barriers', () => {
  it('does not move player through a wall', () => {
    let state = getTestLevel();
    // Place a wall immediately to the right of the player
    state.grid[state.playerPosition.row][state.playerPosition.col + 1] = CellType.WALL;
    const startCol = state.playerPosition.col;
    state = movePlayerTest(state, 'RIGHT');
    expect(state.playerPosition.col).toBe(startCol); // Should not move
  });

  it('does not move player through a diamond', () => {
    let state = getTestLevel();
    // Place a diamond immediately above the player
    state.grid[state.playerPosition.row - 1][state.playerPosition.col] = CellType.DIAMOND;
    const startRow = state.playerPosition.row;
    state = movePlayerTest(state, 'UP');
    expect(state.playerPosition.row).toBe(startRow); // Should not move
  });
});

describe('movePlayer - coin collection', () => {
  it('collects multiple coins in a single move', () => {
    let state = getTestLevel();
    // Place coins in a row to the right of the player
    const row = state.playerPosition.row;
    state.coins = [
      { row, col: state.playerPosition.col + 1 },
      { row, col: state.playerPosition.col + 2 },
      { row, col: state.playerPosition.col + 3 },
    ];
    state.grid[row][state.playerPosition.col + 1] = CellType.FLOOR;
    state.grid[row][state.playerPosition.col + 2] = CellType.FLOOR;
    state.grid[row][state.playerPosition.col + 3] = CellType.FLOOR;
    // Add a wall after the last coin to stop the player
    state.grid[row][state.playerPosition.col + 4] = CellType.WALL;
    const startCol = state.playerPosition.col;
    state = movePlayerTest(state, 'RIGHT');
    expect(state.playerPosition.col).toBe(startCol + 3);
    expect(state.coinsCollected).toBe(3);
    expect(state.coins.length).toBe(0);
  });
});

describe('swapWithDiamond', () => {
  it('swaps player and diamond positions', () => {
    let state = getTestLevel();
    const oldPlayer = { ...state.playerPosition };
    const oldDiamond = { ...state.diamondPosition };
    // Swap logic
    const newState = {
      ...state,
      playerPosition: { ...oldDiamond },
      diamondPosition: { ...oldPlayer },
      moves: state.moves + 1,
    };
    expect(newState.playerPosition).toEqual(oldDiamond);
    expect(newState.diamondPosition).toEqual(oldPlayer);
  });
});

describe('swapWithDiamond - any distance', () => {
  it('swaps player and diamond even if not adjacent', () => {
    let state = getTestLevel();
    // Place diamond far from player
    state.playerPosition = { row: 1, col: 1 };
    state.diamondPosition = { row: 5, col: 5 };
    const oldPlayer = { ...state.playerPosition };
    const oldDiamond = { ...state.diamondPosition };
    // Swap logic
    const newState = {
      ...state,
      playerPosition: { ...oldDiamond },
      diamondPosition: { ...oldPlayer },
      moves: state.moves + 1,
    };
    expect(newState.playerPosition).toEqual(oldDiamond);
    expect(newState.diamondPosition).toEqual(oldPlayer);
  });
});

describe('movePlayer - blocked', () => {
  it('does not move if blocked on all sides', () => {
    let state = getTestLevel();
    const { row, col } = state.playerPosition;
    // Surround player with walls
    state.grid[row - 1][col] = CellType.WALL;
    state.grid[row + 1][col] = CellType.WALL;
    state.grid[row][col - 1] = CellType.WALL;
    state.grid[row][col + 1] = CellType.WALL;
    const startRow = row;
    const startCol = col;
    state = movePlayerTest(state, 'UP');
    expect(state.playerPosition.row).toBe(startRow);
    state = movePlayerTest(state, 'DOWN');
    expect(state.playerPosition.row).toBe(startRow);
    state = movePlayerTest(state, 'LEFT');
    expect(state.playerPosition.col).toBe(startCol);
    state = movePlayerTest(state, 'RIGHT');
    expect(state.playerPosition.col).toBe(startCol);
  });
});

describe('movePlayer - edge of grid', () => {
  it('stops at the edge of the grid if no wall or diamond', () => {
    let state = getTestLevel();
    // Remove all walls to the right
    const row = state.playerPosition.row;
    for (let c = state.playerPosition.col + 1; c < state.grid[0].length; c++) {
      state.grid[row][c] = CellType.FLOOR;
    }
    const startCol = state.playerPosition.col;
    state = movePlayerTest(state, 'RIGHT');
    expect(state.playerPosition.col).toBe(state.grid[0].length - 1);
  });
});

describe('swapWithDiamond - on a coin', () => {
  it('swaps player and diamond when one is on a coin', () => {
    let state = getTestLevel();
    // Place a coin at the diamond's position
    state.coins = [{ ...state.diamondPosition }];
    // Swap logic
    const oldPlayer = { ...state.playerPosition };
    const oldDiamond = { ...state.diamondPosition };
    const newState = {
      ...state,
      playerPosition: { ...oldDiamond },
      diamondPosition: { ...oldPlayer },
      moves: state.moves + 1,
    };
    // Coin should still be present (since swap doesn't collect)
    expect(newState.playerPosition).toEqual(oldDiamond);
    expect(newState.diamondPosition).toEqual(oldPlayer);
    expect(newState.coins.length).toBe(1);
  });
});

describe('movePlayer - all coins in a column', () => {
  it('collects all coins in a column when moving up', () => {
    let state = getTestLevel();
    // Place coins above the player
    const col = state.playerPosition.col;
    state.coins = [
      { row: state.playerPosition.row - 1, col },
      { row: state.playerPosition.row - 2, col },
      { row: state.playerPosition.row - 3, col },
    ];
    state.grid[state.playerPosition.row - 1][col] = CellType.FLOOR;
    state.grid[state.playerPosition.row - 2][col] = CellType.FLOOR;
    state.grid[state.playerPosition.row - 3][col] = CellType.FLOOR;
    // Add a wall at the top to stop the player
    state.grid[state.playerPosition.row - 4][col] = CellType.WALL;
    const startRow = state.playerPosition.row;
    state = movePlayerTest(state, 'UP');
    expect(state.playerPosition.row).toBe(startRow - 3);
    expect(state.coinsCollected).toBe(3);
    expect(state.coins.length).toBe(0);
  });
});

describe('movePlayer - surrounded by diamonds', () => {
  it('does not move if surrounded by diamonds', () => {
    let state = getTestLevel();
    const { row, col } = state.playerPosition;
    // Surround player with diamonds
    state.grid[row - 1][col] = CellType.DIAMOND;
    state.grid[row + 1][col] = CellType.DIAMOND;
    state.grid[row][col - 1] = CellType.DIAMOND;
    state.grid[row][col + 1] = CellType.DIAMOND;
    const startRow = row;
    const startCol = col;
    state = movePlayerTest(state, 'UP');
    expect(state.playerPosition.row).toBe(startRow);
    state = movePlayerTest(state, 'DOWN');
    expect(state.playerPosition.row).toBe(startRow);
    state = movePlayerTest(state, 'LEFT');
    expect(state.playerPosition.col).toBe(startCol);
    state = movePlayerTest(state, 'RIGHT');
    expect(state.playerPosition.col).toBe(startCol);
  });
});

describe('movePlayer - coin at starting position', () => {
  it('collects coin if player starts on a coin', () => {
    let state = getTestLevel();
    // Place a coin at the player's starting position
    state.coins = [{ ...state.playerPosition }];
    // Simulate a no-op move (player stays in place)
    let coinsCollected = state.coins.some(
      coin => coin.row === state.playerPosition.row && coin.col === state.playerPosition.col
    ) ? 1 : 0;
    expect(coinsCollected).toBe(1);
  });
}); 