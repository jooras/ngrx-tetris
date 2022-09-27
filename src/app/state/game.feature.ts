import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { allTetrominos, Tetromino } from '../models';
import { gameActions } from './game.actions';
import { assign, mergeToMatrix, wouldCollideWithMatrix, wouldCollideWithScreen } from '../helpers';
import { fromTetromino } from './tetromino.feature';


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
	ended: boolean;
	score: number;
}

const initialState: GameState = {
	landed: emptyMatrix,
	screen: emptyMatrix,
	ended: false,
	score: 0
};

export const gameFeature = createFeature({
	name: 'game',
	reducer: createReducer(
		initialState,

		on(gameActions.renderScreen, (state, { tetromino }) =>
			assign(state, { screen: mergeToMatrix(state.landed, tetromino) })
		),

		on(gameActions.mergeTetromino, (state, { tetromino }) =>
			assign(state, {
				landed: mergeToMatrix(state.landed, tetromino)
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

const { selectLanded, selectScreen, selectEnded, selectScore } = gameFeature;

const selectTetrominoHasLanded = createSelector(
	selectLanded,
	fromTetromino.selectTetromino,
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
	selectEnded,
	selectScore,
	selectTetrominoHasLanded,
	selectCompletedRows
};
