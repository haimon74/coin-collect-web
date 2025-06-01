import React, { useEffect, useState, useCallback } from 'react';
import { GameState, CellType, Position, Direction } from '../types/game';
import { levels } from '../data/levels';
import styles from '../styles/Game.module.css';
import GameGrid from './GameGrid';
import GameInfo from './GameInfo';

const MAX_MOVES = 1024;

const initializeLevel = (levelIndex: number, totalMoves: number = 0): GameState => {
  console.log('Initializing level:', levelIndex);
  if (levelIndex < 0 || levelIndex >= levels.length) {
    console.error('Invalid level index:', levelIndex);
    levelIndex = 0;
  }

  const level = levels[levelIndex];
  console.log('Level data:', {
    totalCoins: level.totalCoins,
    playerStart: level.playerStart,
    diamondStart: level.diamondStart,
    gridSize: `${level.grid.length}x${level.grid[0].length}`
  });

  return {
    grid: level.grid.map(row => [...row]),
    playerPosition: { ...level.playerStart },
    diamondPosition: { ...level.diamondStart },
    moves: 0,
    coinsCollected: 0,
    totalCoins: level.totalCoins,
    currentLevel: levelIndex,
    coins: level.coins.map(pos => ({ ...pos })),
    totalMoves,
  };
};

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    console.log('Creating initial game state');
    return initializeLevel(0, 0);
  });
  const [showControls, setShowControls] = useState(false);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('Game state updated:', {
      level: gameState.currentLevel + 1,
      moves: gameState.moves,
      coinsCollected: gameState.coinsCollected,
      totalCoins: gameState.totalCoins,
      playerPos: gameState.playerPosition,
      diamondPos: gameState.diamondPosition
    });
  }, [gameState]);

  const resetLevel = useCallback(() => {
    setGameState(prev => {
      const prevMoves = prev.moves;
      const newLevelState = initializeLevel(prev.currentLevel, prev.totalMoves - prevMoves);
      return {
        ...prev,
        ...newLevelState,
      };
    });
  }, []);

  const movePlayer = useCallback((direction: Direction) => {
    if (gameState.moves >= MAX_MOVES) return;

    const { playerPosition, grid, diamondPosition } = gameState;
    let newRow = playerPosition.row;
    let newCol = playerPosition.col;
    let moved = false;
    let path: Position[] = [];

    console.log('Moving player:', { direction, from: { row: newRow, col: newCol } });

    switch (direction) {
      case 'UP':
        while (newRow > 0) {
          const nextCell = grid[newRow - 1][newCol];
          const isNextCellDiamond = newRow - 1 === diamondPosition.row && newCol === diamondPosition.col;
          if (nextCell === CellType.WALL || isNextCellDiamond) break;
          newRow--;
          path.push({ row: newRow, col: newCol });
          moved = true;
        }
        break;
      case 'DOWN':
        while (newRow < grid.length - 1) {
          const nextCell = grid[newRow + 1][newCol];
          const isNextCellDiamond = newRow + 1 === diamondPosition.row && newCol === diamondPosition.col;
          if (nextCell === CellType.WALL || isNextCellDiamond) break;
          newRow++;
          path.push({ row: newRow, col: newCol });
          moved = true;
        }
        break;
      case 'LEFT':
        while (newCol > 0) {
          const nextCell = grid[newRow][newCol - 1];
          const isNextCellDiamond = newRow === diamondPosition.row && newCol - 1 === diamondPosition.col;
          if (nextCell === CellType.WALL || isNextCellDiamond) break;
          newCol--;
          path.push({ row: newRow, col: newCol });
          moved = true;
        }
        break;
      case 'RIGHT':
        while (newCol < grid[0].length - 1) {
          const nextCell = grid[newRow][newCol + 1];
          const isNextCellDiamond = newRow === diamondPosition.row && newCol + 1 === diamondPosition.col;
          if (nextCell === CellType.WALL || isNextCellDiamond) break;
          newCol++;
          path.push({ row: newRow, col: newCol });
          moved = true;
        }
        break;
    }

    if (moved) {
      console.log('Player moved to:', { row: newRow, col: newCol });
      setGameState(prev => {
        // Collect coins along the path
        let newCoins = prev.coins.filter(
          coin => !path.some(pos => pos.row === coin.row && pos.col === coin.col)
        );
        let coinsCollected = prev.coinsCollected + (prev.coins.length - newCoins.length);
        return {
          ...prev,
          playerPosition: { row: newRow, col: newCol },
          moves: prev.moves + 1,
          totalMoves: prev.totalMoves + 1,
          coins: newCoins,
          coinsCollected,
        };
      });
    }
  }, [gameState]);

  const swapWithDiamond = useCallback(() => {
    if (gameState.moves >= MAX_MOVES) return;

    const { playerPosition, diamondPosition } = gameState;
    const dx = Math.abs(playerPosition.row - diamondPosition.row);
    const dy = Math.abs(playerPosition.col - diamondPosition.col);

    console.log('Attempting swap:', {
      playerPos: playerPosition,
      diamondPos: diamondPosition,
      distance: { dx, dy }
    });


    setGameState(prev => ({
      ...prev,
      playerPosition: { ...prev.diamondPosition },
      diamondPosition: { ...prev.playerPosition },
      moves: prev.moves + 1,
      totalMoves: prev.totalMoves + 1,
    }));
  }, [gameState]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        movePlayer('UP');
        break;
      case 'ArrowDown':
        movePlayer('DOWN');
        break;
      case 'ArrowLeft':
        movePlayer('LEFT');
        break;
      case 'ArrowRight':
        movePlayer('RIGHT');
        break;
      case ' ':
        swapWithDiamond();
        break;
      case 'Control':
        resetLevel();
        break;
    }
  }, [movePlayer, swapWithDiamond, resetLevel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    console.log('Checking level completion:', {
      coinsCollected: gameState.coinsCollected,
      totalCoins: gameState.totalCoins,
      currentLevel: gameState.currentLevel
    });

    if (gameState.coinsCollected === gameState.totalCoins && gameState.totalCoins > 0) {
      console.log('Level completed!');
      if (gameState.currentLevel < levels.length - 1) {
        console.log('Moving to next level:', gameState.currentLevel + 1);
        const nextLevel = gameState.currentLevel + 1;
        setGameState(prev => initializeLevel(nextLevel, prev.totalMoves));
      } else {
        console.log('All levels completed!');
        alert('Congratulations! You completed all levels!');
        setGameState(prev => initializeLevel(0, prev.totalMoves));
      }
    }
  }, [gameState.coinsCollected, gameState.totalCoins, gameState.currentLevel]);

  const renderCell = (cell: CellType, row: number, col: number) => {
    if (row === gameState.playerPosition.row && col === gameState.playerPosition.col) {
      return CellType.PLAYER;
    }
    if (row === gameState.diamondPosition.row && col === gameState.diamondPosition.col) {
      return CellType.DIAMOND;
    }
    if (gameState.coins.some(pos => pos.row === row && pos.col === col)) {
      return CellType.COIN;
    }
    if (cell === CellType.FLOOR) {
      return ' ';
    }
    return cell;
  };

  // Debug render to verify cell types, including player and diamond
  useEffect(() => {
    const debugGrid = gameState.grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (rowIndex === gameState.playerPosition.row && colIndex === gameState.playerPosition.col) {
          return CellType.PLAYER;
        }
        if (rowIndex === gameState.diamondPosition.row && colIndex === gameState.diamondPosition.col) {
          return CellType.DIAMOND;
        }
        return cell;
      }).join('')
    ).join('\n');
    console.log('Grid cell types (with player and diamond):', debugGrid);
  }, [gameState.grid, gameState.playerPosition, gameState.diamondPosition]);

  // Helper to determine direction for a move
  const getDirection = (row: number, col: number): Direction | null => {
    if (row === gameState.playerPosition.row && col !== gameState.playerPosition.col) {
      return col > gameState.playerPosition.col ? 'RIGHT' : 'LEFT';
    }
    if (col === gameState.playerPosition.col && row !== gameState.playerPosition.row) {
      return row > gameState.playerPosition.row ? 'DOWN' : 'UP';
    }
    return null;
  };

  return (
    <div className={styles.gameContainer}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <GameInfo
          level={gameState.currentLevel + 1}
          moves={gameState.totalMoves}
          maxMoves={MAX_MOVES}
          coinsCollected={gameState.coinsCollected}
          totalCoins={gameState.totalCoins}
          onReset={resetLevel}
          onSwap={swapWithDiamond}
        />
        <button
          aria-label="Show Game Controls"
          style={{ fontSize: 24, width: 36, height: 36, borderRadius: '50%', border: 'none', background: '#eee', cursor: 'pointer', marginLeft: 8 }}
          onClick={() => setShowControls(v => !v)}
        >
          ?
        </button>
        {showControls && (
          <div style={{ position: 'absolute', top: 70, right: 30, zIndex: 10, background: 'white', border: '1px solid #ccc', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', padding: 20, minWidth: 220 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Game Controls</div>
            <p>Move: ↑↓←→</p>
            <p>Space : Swap with Diamond</p>
            <p>Ctrl : Reset Level</p>
            <button style={{ marginTop: 10, background: '#2196F3', color: 'white', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} onClick={() => setShowControls(false)}>Close</button>
          </div>
        )}
      </div>
      <GameGrid
        grid={gameState.grid}
        playerPosition={gameState.playerPosition}
        diamondPosition={gameState.diamondPosition}
        coins={gameState.coins}
        onCellClick={(row, col) => {
          const isDiamond = row === gameState.diamondPosition.row && col === gameState.diamondPosition.col;
          const isPlayer = row === gameState.playerPosition.row && col === gameState.playerPosition.col;
          const direction = getDirection(row, col);
          if (isDiamond) {
            swapWithDiamond();
          } else if (direction && !isPlayer && gameState.grid[row][col] !== CellType.WALL) {
            movePlayer(direction);
          }
        }}
        renderCell={renderCell}
        cellClass={styles.gameCell}
        rowClass={styles.gameRow}
        gridClass={styles.gameGrid}
      />
    </div>
  );
};

export default Game; 