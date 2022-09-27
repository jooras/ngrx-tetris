import { createAction, props } from '@ngrx/store';
import { Tetromino, TetrominoMove } from '../models';
import { createActionTypeFactory } from '../helpers';


const createActionType = createActionTypeFactory('Game');

const start = createAction(
	createActionType('Start')
);

const tick = createAction(
	createActionType('Tick')
);

const refreshScreen = createAction(
	createActionType('Refresh screen')
);

const gameOver = createAction(
	createActionType('Game over')
);

const addScore = createAction(
	createActionType('Add score'),
	props<{ score: number; }>()
);


const spawnTetromino = createAction(
	createActionType('Spawn tetromino')
);

const tetrominoSpawned = createAction(
	createActionType('Tetromino spawned'),
	props<{ tetromino: Tetromino; }>()
);

const landTetromino = createAction(
	createActionType('Land tetromino')
);

const eraseGivenRows = createAction(
	createActionType('Erase rows'),
	props<{ rows: number[]; }>()
);

const rowsErased = createAction(
	createActionType('Rows erased'),
	props<{ landed: number[][]; totalRows: number; }>()
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


export const gameActions = {
	start,
	tick,
	refreshScreen,
	gameOver,
	addScore,

	spawnTetromino,
	tetrominoSpawned,

	landTetromino,
	eraseGivenRows,
	rowsErased,

	rotateTetromino,
	moveTetrominoDown,
	moveTetrominoLeft,
	moveTetrominoRight,
	tetrominoMoved
};
