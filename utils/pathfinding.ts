
import type { Grid, Position, Path } from '../types';
import { CellType } from '../types';

export const findPath = (grid: Grid, start: Position, end: Position): Path | null => {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: { pos: Position; path: Path }[] = [{ pos: start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.row},${start.col}`);

  const isWalkable = (row: number, col: number) => {
    const cellType = grid[row][col].type;
    return cellType !== CellType.OBSTACLE && cellType !== CellType.TABLE;
  };

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    if (pos.row === end.row && pos.col === end.col) {
      return path;
    }

    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 },  // right
    ];

    for (const dir of directions) {
      const newRow = pos.row + dir.row;
      const newCol = pos.col + dir.col;
      const newPosKey = `${newRow},${newCol}`;

      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        !visited.has(newPosKey) &&
        isWalkable(newRow, newCol)
      ) {
        visited.add(newPosKey);
        const newPath = [...path, { row: newRow, col: newCol }];
        queue.push({ pos: { row: newRow, col: newCol }, path: newPath });
      }
    }
  }

  return null; // No path found
};
