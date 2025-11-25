
import React, { useState, useEffect, useCallback } from 'react';
import type { Position, Grid, Path } from './types';
import { CellType, GameStatus } from './types';
import GridCellComponent from './components/GridCell';
import Character from './components/Character';
import { findPath } from './utils/pathfinding';

const GRID_SIZE = 15;
const CELL_SIZE_PX = 32;

const createInitialGrid = (): Grid => {
  const grid: Grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ type: CellType.FLOOR }))
  );

  // Add walls
  for (let i = 0; i < GRID_SIZE; i++) {
    grid[0][i].type = CellType.OBSTACLE;
    grid[GRID_SIZE - 1][i].type = CellType.OBSTACLE;
    grid[i][0].type = CellType.OBSTACLE;
    grid[i][GRID_SIZE - 1].type = CellType.OBSTACLE;
  }

  // Door
  grid[1][0].type = CellType.DOOR;
  
  // Target Table
  grid[GRID_SIZE - 3][GRID_SIZE - 3].type = CellType.TARGET_TABLE;
  grid[GRID_SIZE - 3][GRID_SIZE - 2].type = CellType.TARGET_TABLE;
  grid[GRID_SIZE - 2][GRID_SIZE - 3].type = CellType.TARGET_TABLE;
  grid[GRID_SIZE - 2][GRID_SIZE - 2].type = CellType.TARGET_TABLE;


  // 3x3 grid of tables (2x2 size)
  const tablePositions = [
    [2, 2], [2, 6], [2, 10],
    [6, 2], [6, 6], [6, 10],
    [10, 2], [10, 6] // Leave one spot for the target table
  ];

  tablePositions.forEach(([r, c]) => {
    grid[r][c].type = CellType.TABLE;
    grid[r+1][c].type = CellType.TABLE;
    grid[r][c+1].type = CellType.TABLE;
    grid[r+1][c+1].type = CellType.TABLE;
  });

  // Obstacles (other servers, spills)
  grid[5][5].type = CellType.OBSTACLE;
  grid[5][6].type = CellType.OBSTACLE;
  grid[9][8].type = CellType.OBSTACLE;
  grid[4][12].type = CellType.OBSTACLE;


  return grid;
};

const START_POS: Position = { row: 1, col: 1 };
const END_POS: Position = { row: GRID_SIZE - 3, col: GRID_SIZE - 4 };

const App: React.FC = () => {
  const [grid] = useState<Grid>(createInitialGrid());
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [path, setPath] = useState<Path>([]);

  const [waiterPos, setWaiterPos] = useState<Position>(START_POS);
  const [client1Pos, setClient1Pos] = useState<Position>(START_POS);
  const [client2Pos, setClient2Pos] = useState<Position>(START_POS);

  const resetPositions = useCallback(() => {
    setWaiterPos(START_POS);
    setClient1Pos(START_POS);
    setClient2Pos(START_POS);
  }, []);

  const handleStartGame = useCallback(() => {
    resetPositions();
    setPath([]);
    const foundPath = findPath(grid, START_POS, END_POS);
    if (foundPath) {
      setPath(foundPath);
      setGameStatus(GameStatus.SHOWING_PATH);
      setTimeout(() => {
        setGameStatus(GameStatus.MOVING);
      }, 1000); // Show path for 1 second before moving
    } else {
      setGameStatus(GameStatus.NO_PATH);
    }
  }, [grid, resetPositions]);

  useEffect(() => {
    if (gameStatus !== GameStatus.MOVING || path.length === 0) {
      return;
    }

    let step = 0;
    const intervalId = setInterval(() => {
      if (step >= path.length + 2) { // +2 to allow clients to catch up
        clearInterval(intervalId);
        setGameStatus(GameStatus.FINISHED);
        return;
      }
      
      // Move waiter
      if(step < path.length) {
        setWaiterPos(path[step]);
      }

      // Move client 1 (lags 1 step)
      if (step > 0 && step <= path.length) {
        setClient1Pos(path[step - 1]);
      }

      // Move client 2 (lags 2 steps)
      if (step > 1 && step <= path.length + 1) {
        setClient2Pos(path[step - 2]);
      }
      
      step++;
    }, 200);

    return () => clearInterval(intervalId);
  }, [gameStatus, path]);
  
  const getButtonText = () => {
    switch (gameStatus) {
      case GameStatus.IDLE:
        return 'Seat Guests';
      case GameStatus.SHOWING_PATH:
        return 'Path Found!';
      case GameStatus.MOVING:
        return 'On Our Way...';
      case GameStatus.FINISHED:
        return 'Play Again';
      case GameStatus.NO_PATH:
        return 'No Path! Try Again';
      default:
        return 'Start';
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl mb-2 text-yellow-300">Pixel Restaurant</h1>
      <p className="mb-6 text-sm text-gray-400">Help the waiter find the table!</p>
      
      <div 
        className="relative border-4 border-gray-600 bg-gray-700 p-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE_PX}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE_PX}px)`,
          width: `${GRID_SIZE * CELL_SIZE_PX + 16}px`, // +16 for padding
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isPathCell = gameStatus === GameStatus.SHOWING_PATH && path.some(p => p.row === r && p.col === c);
            return (
              <GridCellComponent
                key={`${r}-${c}`}
                type={cell.type}
                isPath={isPathCell}
              />
            );
          })
        )}
        <Character type="WAITER" position={waiterPos} cellSize={CELL_SIZE_PX} />
        <Character type="CLIENT" position={client1Pos} cellSize={CELL_SIZE_PX} />
        <Character type="CLIENT" position={client2Pos} cellSize={CELL_SIZE_PX} />
      </div>

      <button
        onClick={handleStartGame}
        disabled={gameStatus === GameStatus.MOVING || gameStatus === GameStatus.SHOWING_PATH}
        className="mt-6 px-6 py-3 bg-green-600 text-white text-lg rounded-md border-b-4 border-green-800 hover:bg-green-500 active:border-b-2 active:translate-y-px disabled:bg-gray-500 disabled:border-gray-600 disabled:cursor-not-allowed transition-all duration-150"
      >
        {getButtonText()}
      </button>
       {gameStatus === GameStatus.FINISHED && <p className="mt-4 text-yellow-400">Guests have been seated!</p>}
       {gameStatus === GameStatus.NO_PATH && <p className="mt-4 text-red-500">Could not find a path to the table!</p>}
    </div>
  );
};

export default App;
