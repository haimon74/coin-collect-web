import React from 'react';

interface GameInfoProps {
  level: number;
  moves: number;
  maxMoves: number;
  coinsCollected: number;
  totalCoins: number;
  onReset: () => void;
  onSwap: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({
  level, moves, maxMoves, coinsCollected, totalCoins, onReset, onSwap
}) => (
  <div className="game-info" style={{marginBottom: '4px'}}>
    <span style={{marginRight: 10}}>Level: {level} Moves: {moves}/{maxMoves}  Coins: {coinsCollected}/{totalCoins}</span>
    <button onClick={onReset}>Reset Level (Ctrl)</button>
    <button className="swap-btn" onClick={onSwap} style={{ fontSize: '1.1em', background: '#2196F3', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', marginLeft: 8 }}>
      Swap (Space)
    </button>
  </div>
);

export default GameInfo; 