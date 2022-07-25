import { createAction, props } from '@ngrx/store';
import { Tetromino, TetrominoMove } from '../models';

enum ActionTypes {
	START = '[Game] Start',
	TICK = '[Game] Tick',
	REFRESH_SCREEN = '[Game] Refresh screen',
	GAME_OVER = '[Game] Game over',
	ADD_SCORE = '[Game] Add score',

	SPAWN_TETROMINO = '[Game] Spawn tetromino',
	TETROMINO_SPAWNED = '[Game] Tetromino spawned',

	LAND_TETROMINO = '[Game] Land tetromino',
	ERASE_ROWS = '[Game] Erase rows',
	ROWS_ERASED = '[Game] Rows erased',

	ROTATE_TETROMINO = '[Game] Rotate tetromino',
	MOVE_TETROMINO_DOWN = '[Game] Move tetromino down',
	MOVE_TETROMINO_LEFT = '[Game] Move tetromino left',
	MOVE_TETROMINO_RIGHT = '[Game] Move tetromino right',
	TETROMINO_MOVED = '[Game] Tetromino moved'
}

export const start = createAction(
	ActionTypes.START
);

export const tick = createAction(
	ActionTypes.TICK
);

export const refreshScreen = createAction(
	ActionTypes.REFRESH_SCREEN
);

export const gameOver = createAction(
	ActionTypes.GAME_OVER
);

export const addScore = createAction(
	ActionTypes.ADD_SCORE,
	props<{ score: number; }>()
);


export const spawnTetromino = createAction(
	ActionTypes.SPAWN_TETROMINO
);

export const tetrominoSpawned = createAction(
	ActionTypes.TETROMINO_SPAWNED,
	props<{ tetromino: Tetromino; }>()
);

export const landTetromino = createAction(
	ActionTypes.LAND_TETROMINO
);

export const eraseRows = createAction(
	ActionTypes.ERASE_ROWS,
	props<{ completedRows: number[]; }>()
);

export const rowsErased = createAction(
	ActionTypes.ROWS_ERASED,
	props<{ landed: number[][]; totalRows: number; }>()
);

export const rotateTetromino = createAction(
	ActionTypes.ROTATE_TETROMINO
);

export const moveTetrominoDown = createAction(
	ActionTypes.MOVE_TETROMINO_DOWN
);

export const moveTetrominoLeft = createAction(
	ActionTypes.MOVE_TETROMINO_LEFT
);

export const moveTetrominoRight = createAction(
	ActionTypes.MOVE_TETROMINO_RIGHT
);

export const tetrominoMoved = createAction(
	ActionTypes.TETROMINO_MOVED,
	props<{ tetromino: Tetromino; }>()
);


export const fromGame = {
	start,
	tick,
	refreshScreen,
	gameOver,
	addScore,

	spawnTetromino,
	tetrominoSpawned,

	landTetromino,
	eraseRows,
	rowsErased,

	rotateTetromino,
	moveTetrominoDown,
	moveTetrominoLeft,
	moveTetrominoRight,
	tetrominoMoved
};
