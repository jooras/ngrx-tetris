import { createAction, props } from '@ngrx/store';
import { Tetromino, TetrominoMove } from '../models';

enum ActionTypes {
	START = '[Game] Start',
	TICK = '[Game] Tick',
	REFRESH_SCREEN = '[Game] Refresh screen',
	GAME_OVER = '[Game] Game over',

	SPAWN_TETROMINO = '[Game] Spawn tetromino',
	TETROMINO_SPAWNED = '[Game] Tetromino spawned',
	LAND_TETROMINO = '[Game] Land tetromino',
	ROTATE_TETROMINO = '[Game] Rotate tetromino',
	MOVE_TETROMINO_DOWN = '[Game] Move tetromino down',
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

export const rotateTetromino = createAction(
	ActionTypes.ROTATE_TETROMINO
);

export const moveTetrominoDown = createAction(
	ActionTypes.MOVE_TETROMINO_DOWN
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

	spawnTetromino,
	tetrominoSpawned,
	landTetromino,
	rotateTetromino,
	moveTetrominoDown,
	tetrominoMoved
};
