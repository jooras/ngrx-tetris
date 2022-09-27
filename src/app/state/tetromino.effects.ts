import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { allTetrominos, Tetromino } from '../models';
import { assign, wouldCollideWithMatrix, wouldCollideWithScreen } from '../helpers';
import { tetrominoActions } from './tetromino.actions';
import { fromGame } from './game.feature';
import { fromTetromino } from './tetromino.feature';


interface TetrominoMoveArgs { tetromino: Tetromino, landed: number[][] }

@Injectable()
export class TetrominoEffects {
	onRotateTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.rotateTetromino),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.shape = tetromino.shape[0].map((val, index) =>
				tetromino.shape.map(row => row[index]).reverse());

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoDown$ = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.moveTetrominoDown),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.row += 1;

			return this.checkForCollisions(tetromino, landed, true);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoLeft$ = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.moveTetrominoLeft),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.col -= 1;

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoRight$ = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.moveTetrominoRight),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.col += 1;

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onSpawnTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.spawnTetromino),
		concatLatestFrom(() => [
			this.store.select(fromGame.selectLanded)
		]),
		map(args => args[1]),
		map(landed => {
			const tetromino = new allTetrominos[this.getRandomNumber(0, 7)]();
			const notEnoughSpace = wouldCollideWithScreen(landed, tetromino)
				|| wouldCollideWithMatrix(landed, tetromino);

			return { tetromino, notEnoughSpace };
		}),
		switchMap(({ tetromino, notEnoughSpace }) => [
			notEnoughSpace
				? tetrominoActions.unableToSpawnTetromino()
				: tetrominoActions.tetrominoSpawned({ tetromino })
		])
	));

	constructor(
		private actions$: Actions,
		private store: Store<any>
	) { }

	private concatTetrominoAndLandedMatrix(store) {
		return (source$: Observable<any>) => source$.pipe(
			concatLatestFrom(() => [
				store.select(fromTetromino.selectTetromino),
				store.select(fromGame.selectLanded)
			]),
			map(args => {
				const [ action, tetromino, landed ] = args;
				return {
					tetromino: !tetromino ? null : assign(tetromino),
					landed
				};
			}),
		);
	}

	private checkForCollisions(tetromino: Tetromino, landed: number[][], shouldLand) {
		const cannotMove = wouldCollideWithScreen(landed, tetromino)
			|| wouldCollideWithMatrix(landed, tetromino);

		return { tetromino, cannotMove, shouldLand }
	}

	private buildAfterMoveActions({ tetromino, cannotMove, shouldLand }) {
		const actions: Action[] = [];

		if (cannotMove && shouldLand) {
			actions.push(tetrominoActions.tetrominoCollidedDuringMove());
		}
		else if (!cannotMove) {
			actions.push(tetrominoActions.tetrominoMoved({ tetromino }));
		}

		return actions;
	}

	private getRandomNumber(start: number, end: number) {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return Math.floor(Math.random() * (max - min) + min);
	}
}
