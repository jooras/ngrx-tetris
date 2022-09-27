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

const renderScreen = createAction(
	createActionType('Render screen'),
	props<{ tetromino: Tetromino; }>()
);

const gameOver = createAction(
	createActionType('Game over')
);

const addScore = createAction(
	createActionType('Add score'),
	props<{ score: number; }>()
);




const mergeTetromino = createAction(
	createActionType('Merge tetromino'),
	props<{ tetromino: Tetromino; }>()
);

const eraseGivenRows = createAction(
	createActionType('Erase rows'),
	props<{ rows: number[]; }>()
);

const rowsErased = createAction(
	createActionType('Rows erased'),
	props<{ landed: number[][]; totalRows: number; }>()
);




export const gameActions = {
	start,
	tick,
	renderScreen,
	gameOver,
	addScore,

	mergeTetromino,
	eraseGivenRows,
	rowsErased
};
