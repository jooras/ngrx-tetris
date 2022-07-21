import { Injectable } from "@angular/core";

import { allTetrominos, Tetromino, TetrominoMove } from "./models";
import { assign, mergeToMatrix, wouldCollideWithMatrix, wouldCollideWithScreen } from './helpers';


@Injectable()
export class Stage {
	private _landed: number[][] = [];
	private _tetromino: Tetromino | null = null;

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
		return mergeToMatrix(this._landed, this._tetromino);
	}

	spawnTetromino() {
		this._tetromino = new allTetrominos[this.getRandomNumber(0, 7)]();
		return !wouldCollideWithMatrix(this._landed, this._tetromino);
	}

	moveTetromino(direction: TetrominoMove) {
		if (!this._tetromino)
			return;

		switch(direction) {
			case TetrominoMove.left: {
				this.tryMoveTetromino(
					this._tetromino,
					(tetromino) => {
						tetromino.topLeft.col -= 1;
					}
				);

				break;
			}
			case TetrominoMove.right: {
				this.tryMoveTetromino(
					this._tetromino,
					(tetromino) => {
						tetromino.topLeft.col += 1;
					}
				);
				
				break;
			}
			case TetrominoMove.down: {
				this.tryMoveTetromino(
					this._tetromino,
					(tetromino) => {
						tetromino.topLeft.row += 1;
					}
				);
				
				break;
			}
			case TetrominoMove.rotate: {
				this.tryMoveTetromino(
					this._tetromino,
					(tetromino) => {
						tetromino.shape = tetromino.shape[0].map((val, index) => tetromino.shape.map(row => row[index]).reverse());
					}
				);

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
				this._landed = mergeToMatrix(this._landed, this._tetromino);
				throw new Error('Game over');
			}
		}
	}

	renderNextStep(tetromino: Tetromino) {
		const hasLanded = !this.tryMoveTetromino(
			tetromino,
			(t) => {
				t.topLeft.row += 1;
			}
		);

		if (hasLanded) {
			this._landed = mergeToMatrix(this._landed, tetromino);
			this._tetromino = null;
		}

		this.handleCompleteRows();
	}

	private tryMoveTetromino(tetromino: Tetromino, transform: (t: Tetromino) => void) {
		const movedTetromino: Tetromino = assign(tetromino);
		transform(movedTetromino);

		let cannotMove = wouldCollideWithScreen(this._landed, movedTetromino)
			|| wouldCollideWithMatrix(this._landed, movedTetromino);

		if (!cannotMove)
			transform(tetromino);

		return !cannotMove;
	}

	private handleCompleteRows() {
		const completeRows = this._landed
			.filter(row => row.every(col => !!col))
			.map(row => this._landed.indexOf(row));

		if (!!completeRows.length) {
			completeRows.forEach(index => {
				this._landed.splice(index, 1);
				this._landed = [
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					...this._landed
				]
			});
		}
	}

	private getRandomNumber(start: number, end: number) {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return 2 // Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}
}
