import React from 'react';
import { CellType, Position } from '../types/game';

interface GameGridProps {
  grid: CellType[][];
  playerPosition: Position;
  diamondPosition: Position;
  coins: Position[];
  onCellClick: (row: number, col: number) => void;
  renderCell: (cell: CellType, row: number, col: number) => React.ReactNode;
  cellClass?: string;
  rowClass?: string;
  gridClass?: string;
}

const GameGrid: React.FC<GameGridProps> = ({
  grid, playerPosition, diamondPosition, coins, onCellClick, renderCell, cellClass, rowClass, gridClass
}) => (
  <div className={gridClass}>
    {grid.map((row, rowIndex) => (
      <div key={rowIndex} className={rowClass}>
        {row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cellClass}
            onClick={() => onCellClick(rowIndex, colIndex)}
          >
            {renderCell(cell, rowIndex, colIndex)}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export default GameGrid; 