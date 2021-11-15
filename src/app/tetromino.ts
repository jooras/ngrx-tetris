export enum TetrominoMove {
	rotate,
	down,
	left,
	right
}

export interface ITetromino {
	shape: number[][];
	topLeft: { row: number; col: number; }
}

const defaultCoords = { row: 0, col: 4 };

export class ShapeI implements ITetromino {
	shape = [
		[ 1, 1, 1, 1 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeJ implements ITetromino {
	shape = [
		[ 2, 0, 0 ],
		[ 2, 2, 2 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeL implements ITetromino {
	shape = [
		[ 0, 0, 3 ],
		[ 3, 3, 3 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeO implements ITetromino {
	shape = [
		[ 7, 7 ],
		[ 7, 7 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeS implements ITetromino {
	shape = [
		[ 0, 4, 4 ],
		[ 4, 4, 0 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeT implements ITetromino {
	shape = [
		[ 0, 5, 0 ],
		[ 5, 5, 5 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export class ShapeZ implements ITetromino {
	shape = [
		[ 6, 6, 0 ],
		[ 0, 6, 6 ]
	];
	topLeft = Object.assign({}, defaultCoords);
};

export const allTetrominos = [
	ShapeI, ShapeJ, ShapeL, ShapeO, ShapeS, ShapeT, ShapeZ
]
