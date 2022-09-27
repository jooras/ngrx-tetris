import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, flatMap, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { interval, Observable } from 'rxjs';

import { gameActions } from './game.actions';
import { fromGame } from './game.feature';
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
		ofType(gameActions.start),
		switchMap(() => interval(600).pipe(
			takeUntil(this.store.select(fromGame.selectEnded).pipe(
				filter(gameOver => gameOver),
				take(1)
			))
		)),
		concatLatestFrom(() => [
			this.store.select(fromGame.selectTetrominoExists),
			this.store.select(fromGame.selectTetrominoHasLanded),
			this.store.select(fromGame.selectCompletedRows)
		]),
		map(args => {
			const [ a, tetrominoExists, tetrominoShouldLand, completedRows ] = args;

			return { tetrominoExists, tetrominoShouldLand, completedRows, anyCompletedRows: !!completedRows.length };
		}),
		tap(({ completedRows, anyCompletedRows }) => {
			if (anyCompletedRows)
				this.store.dispatch(gameActions.eraseRows({ completedRows }));
		}),
		tap(({ tetrominoExists, tetrominoShouldLand, completedRows }: GameTickArgs) => {
			let action;

			if (!tetrominoExists) {
				action = gameActions.spawnTetromino();
			}
			else if (tetrominoShouldLand) {
				action = gameActions.landTetromino();
			}
			else {
				action = gameActions.moveTetrominoDown();
			}

			this.store.dispatch(action);
		}),
		concatMap(() => [
			gameActions.refreshScreen()
		])
	));

	onGameOver$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.gameOver),
		concatLatestFrom(() => [
			this.store.select(fromGame.selectScore)
		]),
		map(args => args[1]),
		tap(score => {
			this.store.dispatch(gameActions.landTetromino());
			alert(`GAME OVER! You scored: ${score}`);
		})
	), { dispatch: false });

	onEraseRows$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.eraseRows),
		concatLatestFrom(() => [
			this.store.select(fromGame.selectLanded)
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

			return { landed, totalRows: completedRows.length };
		}),
		switchMap(({ landed, totalRows }) => [
			gameActions.rowsErased({ landed, totalRows })
		])
	));

	onRowsErased$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.rowsErased),
		switchMap(({ landed, totalRows }) => [
			gameActions.addScore({ score: totalRows * 100 })
		])
	));

	onRotateTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.rotateTetromino),
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
		ofType(gameActions.moveTetrominoDown),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.row += 1;

			return this.checkForCollisions(tetromino, landed, true);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoLeft$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.moveTetrominoLeft),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.col -= 1;

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onMoveTetrominoRight$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.moveTetrominoRight),
		this.concatTetrominoAndLandedMatrix(this.store),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }: TetrominoMoveArgs) => {
			tetromino.topLeft.col += 1;

			return this.checkForCollisions(tetromino, landed, false);
		}),
		switchMap(args => this.buildAfterMoveActions(args))
	));

	onSpawnTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.spawnTetromino),
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
				? gameActions.gameOver()
				: gameActions.tetrominoSpawned({ tetromino })
		])
	));

	constructor(
		private actions$: Actions,
		private store: Store<any>
	) { }

	private concatTetrominoAndLandedMatrix(store) {
		return (source$: Observable<any>) => source$.pipe(
			concatLatestFrom(() => [
				store.select(fromGame.selectTetromino),
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
			actions.push(gameActions.landTetromino());
		}
		else if (!cannotMove) {
			actions.push(gameActions.tetrominoMoved({ tetromino }));
		}

		actions.push(gameActions.refreshScreen());

		return actions;
	}

	private getRandomNumber(start: number, end: number) {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return Math.floor(Math.random() * (max - min) + min);
	}
}
