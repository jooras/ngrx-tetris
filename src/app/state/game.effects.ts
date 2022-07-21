import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, flatMap, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { interval } from 'rxjs';

import { fromGame, moveTetrominoDown, rotateTetromino } from './game.actions';
import { gameQueries } from './game.feature';
import { allTetrominos, Tetromino } from '../models';
import { assign, wouldCollideWithMatrix, wouldCollideWithScreen } from '../helpers';


@Injectable()
export class GameEffects {
	onStart$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.start),
		switchMap(() => interval(600).pipe(
			// flatMap(() => null),
			takeUntil(this.store.select(gameQueries.selectEnded).pipe(
				filter(v => v),
				take(1)
			))
		)),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectTetrominoExists),
			this.store.select(gameQueries.selectTetrominoHasLanded)
		]),
		tap(args => {
			const [ action, tetrominoExists, tetrominoShouldLand ] = args;

			if (!tetrominoExists) {
				this.store.dispatch(fromGame.spawnTetromino());
			}
			else if (tetrominoShouldLand) {
				this.store.dispatch(fromGame.landTetromino());
			}
			else {
				this.store.dispatch(fromGame.moveTetrominoDown());
			}

			console.log(`TICK tetrominoExists: ${tetrominoExists}, tetrominoShouldLand: ${tetrominoShouldLand}`)
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

	onRotateTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.rotateTetromino),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectTetromino),
			this.store.select(gameQueries.selectLanded)
		]),
		map(args => {
			const [ action, tetromino, landed ] = args;
			return { tetromino, landed };
		}),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }) => {
			const movedTetromino: Tetromino = assign(tetromino);
			movedTetromino.shape = tetromino.shape[0].map((val, index) =>
				tetromino.shape.map(row => row[index]).reverse())

			const cannotMove = wouldCollideWithScreen(landed, movedTetromino)
				|| wouldCollideWithMatrix(landed, movedTetromino);

			return { tetromino: movedTetromino, cannotMove };
		}),
		switchMap(({ tetromino, cannotMove }) => [
			cannotMove
				? fromGame.landTetromino()
				: fromGame.tetrominoMoved({ tetromino }),
			fromGame.refreshScreen()
		])
	));

	onMoveTetrominoDown$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.moveTetrominoDown),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectTetromino),
			this.store.select(gameQueries.selectLanded)
		]),
		map(args => {
			const [ action, tetromino, landed ] = args;
			return { tetromino, landed };
		}),
		filter(({ tetromino }) => !!tetromino),
		map(({ tetromino, landed }) => {
			const movedTetromino: Tetromino = assign(tetromino);
			movedTetromino.topLeft.row += 1;

			const cannotMove = wouldCollideWithScreen(landed, movedTetromino)
				|| wouldCollideWithMatrix(landed, movedTetromino);

			return { tetromino: movedTetromino, cannotMove };
		}),
		switchMap(({ tetromino, cannotMove }) => [
			cannotMove
				? fromGame.landTetromino()
				: fromGame.tetrominoMoved({ tetromino }),
			fromGame.refreshScreen()
		])
	));

	onSpawnTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(fromGame.spawnTetromino),
		concatLatestFrom(() => [
			this.store.select(gameQueries.selectLanded)
		]),
		map(args => {
			const [ action, landed ] = args;
			return landed;
		}),
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

	private getRandomNumber(start: number, end: number) {
		const min = Math.ceil(start);
		const max = Math.floor(end);
		return 2 // Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
	}
}
