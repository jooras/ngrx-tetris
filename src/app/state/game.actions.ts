import { createAction } from '@ngrx/store';

enum ActionTypes {
	// MOVE_TETROMINO_LEFT = '[Game] Move tetromino left',
	// MOVE_TETROMINO_RIGHT = '[Game] Move tetromino right',
	// MOVE_TETROMINO_DOWN = '[Game] Move tetromino down',
	// ROTATE_TETROMINO = '[Game] Rotate tetromino'

	STEP_FORWARD = '[Game] Step forward',

	MERGE_TO_SCREEN = '[Game] Merge to screen'
}

export const stepForward = createAction(
	ActionTypes.STEP_FORWARD
);

export const mergeToScreen = createAction(
	ActionTypes.MERGE_TO_SCREEN
);


export const fromGame = {
	mergeToScreen
};
