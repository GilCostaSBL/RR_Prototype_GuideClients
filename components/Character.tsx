
import React from 'react';
import type { Position } from '../types';

interface CharacterProps {
  type: 'WAITER' | 'CLIENT';
  position: Position;
  cellSize: number;
}

const Character: React.FC<CharacterProps> = ({ type, position, cellSize }) => {
  const style: React.CSSProperties = {
    top: `${position.row * cellSize}px`,
    left: `${position.col * cellSize}px`,
    width: `${cellSize}px`,
    height: `${cellSize}px`,
    transition: 'top 0.2s linear, left 0.2s linear',
  };

  const color = type === 'WAITER' ? 'bg-blue-500' : 'bg-yellow-400';

  return (
    <div
      className="absolute flex items-center justify-center p-1"
      style={style}
    >
      <div className={`w-full h-full rounded-full ${color} border-2 border-black`}></div>
    </div>
  );
};

export default Character;
