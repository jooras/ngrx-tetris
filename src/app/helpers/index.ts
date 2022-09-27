import { Tetromino } from '../models';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';

export const assign = <TObj extends {}>(destination: TObj, overwriteWith?: Partial<TObj>) => {
	if (!overwriteWith)
		return JSON.parse(JSON.stringify(destination));

	return Object.assign(
		JSON.parse(JSON.stringify(destination || {})),
		JSON.parse(JSON.stringify(overwriteWith || {}))
	) as TObj;
};

export const wouldCollideWithMatrix = (matrix: number[][], tetromino: Tetromino) => {
	let noSpaceLeft: boolean = false;

	iterateOverTetromino(tetromino, ({ row, col, relativeRow, relativeCol }) => {
		if (!!tetromino.shape[relativeRow][relativeCol]) {
			const wouldCollide = !!matrix[row][col];

			if (wouldCollide) {
				noSpaceLeft = noSpaceLeft || true;
			}
		}
	});

	return noSpaceLeft;
};

export const wouldCollideWithScreen = (matrix: number[][], tetromino: Tetromino) => {
	let cannotMove: boolean = false;

	iterateOverTetromino(tetromino, ({ row, col, relativeRow, relativeCol }) => {
		if (!!tetromino.shape[relativeRow][relativeCol]) {
			const wouldLeaveScreen = col < 0
				|| col + 1 > matrix[0].length
				|| row + 1 > matrix.length;

			if (wouldLeaveScreen) {
				cannotMove = cannotMove || true;
			}
		}
	});

	return cannotMove;
};

export const mergeToMatrix = (matrix: number[][], tetromino: Tetromino) => {
	const stage = assign(matrix);

	if (!tetromino)
		return stage;

	iterateOverTetromino(tetromino, ({ row, col, relativeRow, relativeCol }) => {
		stage[row][col] = tetromino.shape[relativeRow][relativeCol] || stage[row][col];
	});

	return stage;
};

export const iterateOverTetromino = (tetromino: Tetromino, callback: ({ row, col, relativeRow, relativeCol }) => void) => {
	if (!tetromino)
		return ;

	for (let row = 0; row < tetromino.shape.length; row++)
		for (let col = 0; col < tetromino.shape[row].length; col++) {
			const absoluteRow = row + tetromino.topLeft.row;
			const absoluteCol = col + tetromino.topLeft.col;

			callback({
				row: absoluteRow,
				col: absoluteCol,
				relativeCol: col,
				relativeRow: row
			});
		}
}

const registeredTypes: string[] = [];

export const createActionTypeFactory = (namespace: string) => (type: string) => {
	const actionType = `[${namespace}] ${type}`;

	if (!!registeredTypes.some(t => t === actionType))
		throw new Error(`Duplicated action type registered: ${actionType}`);

	registeredTypes.push(actionType);

	return actionType;
};
