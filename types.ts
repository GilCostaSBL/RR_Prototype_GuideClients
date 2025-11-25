
export enum CellType {
  FLOOR,
  TABLE,
  OBSTACLE,
  DOOR,
  TARGET_TABLE
}

export interface GridCell {
  type: CellType;
}

export type Grid = GridCell[][];

export interface Position {
  row: number;
  col: number;
}

export type Path = Position[];

export enum CharacterType {
  WAITER,
  CLIENT,
}

export enum GameStatus {
  IDLE,
  SHOWING_PATH,
  MOVING,
  FINISHED,
  NO_PATH,
}
