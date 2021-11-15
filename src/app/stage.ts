import { Injectable } from "@angular/core";

import { allTetrominos, ITetromino, TetrominoMove } from "./tetromino";


 

@Injectable()
export class Stage {
	private _landed: number[][] = [];
	private _tetromino: ITetromino | null = null;

	initialize() {
		this._landed = [
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
	}

	render() {
		const screen = JSON.parse(JSON.stringify(this._landed));
		const tetromino = this._tetromino;

		if (!!tetromino)
			this.iterateTetromino((row, col) => {
				const absoluteRow = row + tetromino.topLeft.row;
				const absoluteCol = col + tetromino.topLeft.col;

				if (!!tetromino.shape[row][col]) {
					screen[absoluteRow][absoluteCol] = tetromino.shape[row][col] || screen[absoluteRow][absoluteCol];
				}
			});

		return screen;
	}

	spawnTetromino() {
		this._tetromino = new allTetrominos[this.getRandomNumber(0, 7)]();

		let noSpaceLeft: boolean = false;
		const tetromino = this._tetromino;

		this.iterateTetromino((row, col) => {
			const absoluteRow = row + tetromino.topLeft.row;
			const absoluteCol = col + tetromino.topLeft.col;

			if (!!tetromino.shape[row][col]) {
				const wouldCollide = !!this._landed[absoluteRow][absoluteCol];

				if (wouldCollide) {
					noSpaceLeft = noSpaceLeft || true;
				}
			}
		});

		return !noSpaceLeft;
	}

	moveTetromino(direction: TetrominoMove) {
		const tetromino = this._tetromino;

		if (!tetromino)
			return;

		switch(direction) {
			case TetrominoMove.left: {
				let cannotMove = false;

				this.iterateTetromino((row, col) => {
					const absoluteRow = row + tetromino.topLeft.row;
					const absoluteCol = col + tetromino.topLeft.col;

					if (!!tetromino.shape[row][col]) {
						const wouldLeaveScreen = absoluteCol === 0;
						const wouldCollide = !wouldLeaveScreen 
							&& !!this._landed[absoluteRow][absoluteCol - 1];

						if (wouldLeaveScreen || wouldCollide) {
							cannotMove = cannotMove || true;
						}
					}
				});

				if (!cannotMove)
					tetromino.topLeft.col -= 1;
				else console.debug('BLOCKED') // TODO:

				break;
			}
			case TetrominoMove.right: {
				let cannotMove = false;

				this.iterateTetromino( (row, col) => {
					const absoluteRow = row + tetromino.topLeft.row;
					const absoluteCol = col + tetromino.topLeft.col;

					if (!!tetromino.shape[row][col]) {
						const wouldLeaveScreen = absoluteCol + 1 >= this._landed[0].length;
						const wouldCollide = !wouldLeaveScreen 
							&& !!this._landed[absoluteRow][absoluteCol + 1];

						if (wouldLeaveScreen || wouldCollide) {
							cannotMove = cannotMove || true;
						}
					}
				});

				if (!cannotMove)
					tetromino.topLeft.col += 1;
				else console.debug('BLOCKED') // TODO:
				
				break;
			}
			case TetrominoMove.down: {
				let cannotMove = false;

				this.iterateTetromino((row, col) => {
					const absoluteRow = row + tetromino.topLeft.row;
					const absoluteCol = col + tetromino.topLeft.col;

					if (!!tetromino.shape[row][col]) {
						const wouldLeaveScreen = absoluteRow + 1 >= this._landed.length;
						const wouldCollide = !wouldLeaveScreen 
							&& !!this._landed[absoluteRow + 1][absoluteCol];

						if (wouldLeaveScreen || wouldCollide) {
							cannotMove = cannotMove || true;
						}
					}
				});

				if (!cannotMove)
					tetromino.topLeft.row += 1;
				else console.debug('BLOCKED') // TODO:
				
				break;
			}
			case TetrominoMove.rotate: {
				let rotatedShape: number[][] = [];
				let cannotMove = false;

				// rotate the matrix
				rotatedShape = tetromino.shape[0].map((val, index) => tetromino.shape.map(row => row[index]).reverse());

				// now check if that roation would collide with anything
				for (let row = 0; row < rotatedShape.length; row++) {
					for (let col = 0; col < rotatedShape[row].length; col++) {
						const absoluteRow = row + tetromino.topLeft.row;
						const absoluteCol = col + tetromino.topLeft.col;

						if (!!rotatedShape[row][col]) {
							const wouldLeaveScreen = absoluteRow >= this._landed.length || absoluteCol >= this._landed[0].length;
							const wouldCollide = !wouldLeaveScreen 
								&& !!this._landed[absoluteRow][absoluteCol];

							if (wouldLeaveScreen || wouldCollide) {
								cannotMove = cannotMove || true;
							}
						}
					}
				}

				if (!cannotMove)
					tetromino.shape = rotatedShape;
				else console.debug('BLOCKED') // TODO:
				
				break;
			}
		}
	}

	tick() {
		if (!!this._tetromino)
			this.renderNextStep(this._tetromino);
		else {
			const canContinue = this.spawnTetromino();

			if (!canContinue) {
				this.iterateTetromino((row, col) => {
					const tetromino = this._tetromino;

					if (!tetromino)
						return;

					const absoluteRow = row + tetromino.topLeft.row;
					const absoluteCol = col + tetromino.topLeft.col;

					this._landed[absoluteRow][absoluteCol] = this._tetromino?.shape[row][col] || this._landed[absoluteRow][absoluteCol];
				});

				throw new Error('Game over');
			}}

	}

	renderNextStep(tetromino: ITetromino) {
		let spawnedHasLanded = false;

		this.iterateTetromino((row, col) => {
			const absoluteRow = row + tetromino.topLeft.row;
			const absoluteCol = col + tetromino.topLeft.col;

			if (!!tetromino.shape[row][col]) {
				const wouldLeaveScreen = row + tetromino.topLeft.row + 1 >= this._landed.length;
				const wouldCollide = !wouldLeaveScreen 
					&& !!this._landed[absoluteRow + 1][absoluteCol];

				if (wouldLeaveScreen || wouldCollide) {
					spawnedHasLanded = spawnedHasLanded || true;
				}
			}
		});

		if (!spawnedHasLanded)
			tetromino.topLeft.row += 1;
		else {
			this.iterateTetromino((row, col) => {
				const absoluteRow = row + tetromino.topLeft.row;
				const absoluteCol = col + tetromino.topLeft.col;

				this._landed[absoluteRow][absoluteCol] = tetromino.shape[row][col] || this._landed[absoluteRow][absoluteCol];
			});
			
			this._tetromino = null;
		}

		const filledIndexes = this._landed
			.filter(row => row.every(col => !!col))
			.map(row => this._landed.indexOf(row));

		if (!!filledIndexes.length) {
			filledIndexes.forEach(index => {
				this._landed.splice(index, 1);
				this._landed = [
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					...this._landed
				]
			});
		}
	}

	private iterateTetromino(callback: (row: number, col: number) => void) {
		if (!this._tetromino)
			return;

		for (let row = 0; row < this._tetromino.shape.length; row++)
			for (let col = 0; col < this._tetromino.shape[row].length; col++) {
				callback(row, col);
			}
	}

	private getRandomNumber(start: number, end: number) {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}
}