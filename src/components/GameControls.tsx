import React from 'react';

const GameControls: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <p>Move: ↑↓←→</p>
    <p>Space : Swap with Diamond</p>
    <p>Ctrl : Reset Level</p>
  </div>
);

export default GameControls; 