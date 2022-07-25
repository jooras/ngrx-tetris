import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, flatMap, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { interval, Observable } from 'rxjs';

import { fromGame, moveTetrominoDown, rotateTetromino } from './game.actions';
import { gameQueries } from './game.feature';
import { allTetrominos, Tetromino } from '../models';
import { assign, wouldCollideWithMatrix, wouldCollideWithScreen } from '../helpers';


interface TetrominoMoveArgs { tetromino: Tetromino, landed: number[][] }

interface GameTickArgs {
	tetrominoExists: boolean,
	tetrominoShouldLand: boolean,
	completedRows: number[],
	anyCompletedRows: boolean
};

@Injectable()
export class GameEffects {
	onStart$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.start),
		switchMap(() => interval(600).pipe(
			takeUntil(this.store.select(gameQueries.selectEnded).pipe(
				filter(gameOver => gameOver),
				take(1)
			))
		)),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectTetrominoExists),
			this.store.select(gameQueries.selectTetrominoHasLanded),
			this.store.select(gameQueries.selectCompletedRows)
		]),
		map(args => {
			const [ a, tetrominoExists, tetrominoShouldLand, completedRows ] = args;

			return { tetrominoExists, tetrominoShouldLand, completedRows, anyCompletedRows: !!completedRows.length };
		}),
		tap(({ completedRows, anyCompletedRows }) => {
			if (anyCompletedRows)
				this.store.dispatch(fromGame.eraseRows({ completedRows }));
		}),
		tap(({ tetrominoExists, tetrominoShouldLand, completedRows }: GameTickArgs) => {
			let action;

			if (!tetrominoExists) {
				action = fromGame.spawnTetromino();
			}
			else if (tetrominoShouldLand) {
				action = fromGame.landTetromino();
			}
			else {
				action = fromGame.moveTetrominoDown();
			}

			this.store.dispatch(action);
		}),
		concatMap(() => [
			fromGame.refreshScreen()
		])
	));

	onGameOver$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.gameOver),
		tap(() => {
			this.store.dispatch(fromGame.landTetromino());
			console.error('GAME OVER :(');
		})
	), { dispatch: false });

	onEraseRows$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.eraseRows),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectLanded)
		]),
		map(args => {
			const [ action, landed ] = args;
			return { landed: [ ...landed ], completedRows: action.completedRows };
		}),
		map(({ landed, completedRows }) => {
			completedRows.forEach(index => {
				landed.splice(index, 1);
				landed = [
					[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					...landed
				]
			});

			return landed;
		}),
		switchMap(landed => [
			fromGame.rowsErased({ landed })
		])
	));

	onRotateTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.rotateTetromino),
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
		ofType(fromGame.moveTetrominoDown),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.row += 1;

			return this.checkForCollisions(tetromino, landed, true);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoLeft$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.moveTetrominoLeft),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.col -= 1;

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoRight$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.moveTetrominoRight),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.col += 1;

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onSpawnTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.spawnTetromino),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectLanded)
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
				? fromGame.gameOver()
				: fromGame.tetrominoSpawned({ tetromino })
		])
	));

	constructor(
		private actions$: Actions,
		private store: Store<any>
	) { }

	private concatTetrominoAndLandedMatrix(store) {
		return (source$: Observable<any>) => source$.pipe(
			concatLatestFrom(() => [
				store.select(gameQueries.selectTetromino),
				store.select(gameQueries.selectLanded)
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
			actions.push(fromGame.landTetromino());
		}
		else if (!cannotMove) {
			actions.push(fromGame.tetrominoMoved({ tetromino }));
		}

		actions.push(fromGame.refreshScreen());

		return actions;
	}

	private getRandomNumber(start: number, end: number) {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}
}
