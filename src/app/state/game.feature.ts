import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { allTetrominos, Tetromino } from '../models';
import { fromGame } from './game.actions';
import { assign, mergeToMatrix, wouldCollideWithMatrix, wouldCollideWithScreen } from '../helpers';


const emptyMatrix = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

export interface GameState {
	landed: number[][];
	screen: number[][];
	tetromino: Tetromino;
	ended: boolean;
}

const initialState: GameState = {
	landed: emptyMatrix,
	screen: emptyMatrix,
	tetromino: null,
	ended: false
};

export const gameFeature = createFeature({
	name: 'game',
	reducer: createReducer(
		initialState,

		on(fromGame.refreshScreen, (state, action) =>
			assign(state, { screen: mergeToMatrix(state.landed, state.tetromino) })
		),

		on(fromGame.tetrominoSpawned, (state, { tetromino }) =>
			assign(state, { tetromino })
		),

		on(fromGame.tetrominoMoved, (state, { tetromino }) =>
			assign(state, { tetromino })
		),

		on(fromGame.landTetromino, (state, action) =>
			assign(state, {
				tetromino: null,
				landed: mergeToMatrix(state.landed, state.tetromino)
			})
		),

		on(fromGame.rowsErased, (state, { landed }) =>
			assign(state, { landed })
		),

		on(fromGame.gameOver, (state, action) =>
			assign(state, { ended: true })
		)
	)
});

const { selectLanded, selectScreen, selectTetromino, selectEnded } = gameFeature;

const selectTetrominoExists = createSelector(
	selectTetromino,
	tetromino => !!tetromino
);

const selectTetrominoHasLanded = createSelector(
	selectLanded,
	selectTetromino,
	(landed, tetromino) => wouldCollideWithScreen(landed, tetromino)
		|| wouldCollideWithMatrix(landed, tetromino)
);

const selectCompletedRows = createSelector(
	selectLanded,
	landed => landed.filter(row => row.every(col => !!col))
		.map(row => landed.indexOf(row))
);

export const gameQueries = {
	selectLanded,
	selectScreen,
	selectTetromino,
	selectEnded,
	selectTetrominoExists,
	selectTetrominoHasLanded,
	selectCompletedRows
};
