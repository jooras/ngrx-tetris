import { createAction, props } from '@ngrx/store';
import { Tetromino } from '../models';
import { createActionTypeFactory } from '../helpers';


const createActionType = createActionTypeFactory('Tetromino');

const clearTetromino = createAction(
	createActionType('Clear tetromino')
);

const spawnTetromino = createAction(
	createActionType('Spawn tetromino')
);

const tetrominoSpawned = createAction(
	createActionType('Tetromino spawned'),
	props<{ tetromino: Tetromino; }>()
);

const unableToSpawnTetromino = createAction(
	createActionType('Unable to spawn tetromino')
);

const rotateTetromino = createAction(
	createActionType('Rotate tetromino')
);

const moveTetrominoDown = createAction(
	createActionType('Move tetromino down')
);

const moveTetrominoLeft = createAction(
	createActionType('Move tetromino left')
);

const moveTetrominoRight = createAction(
	createActionType('Move tetromino right')
);

const tetrominoMoved = createAction(
	createActionType('Tetromino moved'),
	props<{ tetromino: Tetromino; }>()
);

const tetrominoCollidedDuringMove = createAction(
	createActionType('Tetromino collided during move')
);

export const tetrominoActions = {
	clearTetromino,
	spawnTetromino,
	tetrominoSpawned,
	unableToSpawnTetromino,
	rotateTetromino,
	moveTetrominoDown,
	moveTetrominoLeft,
	moveTetrominoRight,
	tetrominoMoved,
	tetrominoCollidedDuringMove
}
