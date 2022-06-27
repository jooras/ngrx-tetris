export enum TetrominoMove {
	rotate,
	down,
	left,
	right
}

export interface Tetromino {
	shape: number[][];
	topLeft: { row: number; col: number; }
}

const defaultCoords = { row: 0, col: 4 };

export class ShapeI implements Tetromino {
	shape = [
		[ 1, 1, 1, 1 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeJ implements Tetromino {
	shape = [
		[ 2, 0, 0 ],
		[ 2, 2, 2 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeL implements Tetromino {
	shape = [
		[ 0, 0, 3 ],
		[ 3, 3, 3 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeO implements Tetromino {
	shape = [
		[ 7, 7 ],
		[ 7, 7 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeS implements Tetromino {
	shape = [
		[ 0, 4, 4 ],
		[ 4, 4, 0 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeT implements Tetromino {
	shape = [
		[ 0, 5, 0 ],
		[ 5, 5, 5 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeZ implements Tetromino {
	shape = [
		[ 6, 6, 0 ],
		[ 0, 6, 6 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export const allTetrominos = [
	ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ
]
