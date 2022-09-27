import { Tetromino } from '../models';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { assign } from '../helpers';
import { tetrominoActions } from './tetromino.actions';


const initialState: Tetromino = null;

export const tetrominoFeature = createFeature({
	name: 'tetromino',
	reducer: createReducer(
		initialState,

		on(tetrominoActions.tetrominoSpawned, (state, { tetromino }) =>
			assign(state, tetromino)
		),

		on(tetrominoActions.tetrominoMoved, (state, { tetromino }) =>
			assign(state, tetromino)
		),

		on(tetrominoActions.clearTetromino, (state, action) =>
			initialState
		)
	)
});

const { selectTetrominoState } = tetrominoFeature;

const selectTetrominoExists = createSelector(
	selectTetrominoState,
	tetromino => !!tetromino
);


export const fromTetromino = {
	selectTetromino: selectTetrominoState,
	selectTetrominoExists
};
