
import React from 'react';
import { CellType } from '../types';

interface GridCellProps {
  type: CellType;
  isPath: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ type, isPath }) => {
  const getCellStyles = () => {
    let baseStyle = 'w-full h-full border border-black/20';
    if (isPath) {
      return `${baseStyle} bg-blue-400/50`;
    }
    switch (type) {
      case CellType.FLOOR:
        return `${baseStyle} bg-gray-500`;
      case CellType.TABLE:
        return `${baseStyle} bg-yellow-800 border-2 border-yellow-900`;
      case CellType.OBSTACLE:
        return `${baseStyle} bg-red-800`;
      case CellType.DOOR:
        return `${baseStyle} bg-green-700`;
      case CellType.TARGET_TABLE:
        return `${baseStyle} bg-purple-700 border-2 border-purple-900`;
      default:
        return baseStyle;
    }
  };

  return <div className={getCellStyles()} />;
};

export default GridCell;
