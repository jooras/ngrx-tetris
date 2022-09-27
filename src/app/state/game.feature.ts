import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { allTetrominos, Tetromino } from '../models';
import { gameActions } from './game.actions';
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
	score: number;
}

const initialState: GameState = {
	landed: emptyMatrix,
	screen: emptyMatrix,
	tetromino: null,
	ended: false,
	score: 0
};

export const gameFeature = createFeature({
	name: 'game',
	reducer: createReducer(
		initialState,

		on(gameActions.refreshScreen, (state, action) =>
			assign(state, { screen: mergeToMatrix(state.landed, state.tetromino) })
		),

		on(gameActions.tetrominoSpawned, (state, { tetromino }) =>
			assign(state, { tetromino })
		),

		on(gameActions.tetrominoMoved, (state, { tetromino }) =>
			assign(state, { tetromino })
		),

		on(gameActions.landTetromino, (state, action) =>
			assign(state, {
				tetromino: null,
				landed: mergeToMatrix(state.landed, state.tetromino)
			})
		),

		on(gameActions.rowsErased, (state, { landed }) =>
			assign(state, { landed })
		),

		on(gameActions.gameOver, (state, action) =>
			assign(state, { ended: true })
		),

		on(gameActions.addScore, (state, { score }) =>
			assign(state, { score: state.score + score })
		)
	)
});

const { selectLanded, selectScreen, selectTetromino, selectEnded, selectScore } = gameFeature;

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

export const fromGame = {
	selectLanded,
	selectScreen,
	selectTetromino,
	selectEnded,
	selectScore,
	selectTetrominoExists,
	selectTetrominoHasLanded,
	selectCompletedRows
};
