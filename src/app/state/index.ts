import { tetrominoActions } from './tetromino.actions';
import { fromTetromino } from './tetromino.feature';
import { gameActions } from './game.actions';
import { fromGame } from './game.feature';

export const tetrisActions = {
	game: gameActions,
	tetromino: tetrominoActions
};

export const fromTetris = {
	game: fromGame,
	tetromino: fromTetromino
};
