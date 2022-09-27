import { Injectable } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { concatMap, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { interval } from 'rxjs';

import { gameActions } from './game.actions';
import { fromGame } from './game.feature';
import { Tetromino } from '../models';
import { tetrominoActions } from './tetromino.actions';
import { fromTetromino } from './tetromino.feature';


interface GameTickArgs {
	tetromino: Tetromino;
	tetrominoExists: boolean;
	tetrominoShouldLand: boolean;
	completedRows: number[];
	anyCompletedRows: boolean;
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
			this.store.select(fromTetromino.selectTetromino),
			this.store.select(fromTetromino.selectTetrominoExists),
			this.store.select(fromGame.selectTetrominoHasLanded),
			this.store.select(fromGame.selectCompletedRows)
		]),
		map(args => {
			const [ action, tetromino, tetrominoExists, tetrominoShouldLand, completedRows ] = args;

			return { tetromino, tetrominoExists, tetrominoShouldLand, completedRows, anyCompletedRows: !!completedRows.length };
		}),
		tap(({ completedRows, anyCompletedRows }) => {
			if (anyCompletedRows)
				this.store.dispatch(gameActions.eraseGivenRows({ rows: completedRows }));
		}),
		map(({ tetromino, tetrominoExists, tetrominoShouldLand }: GameTickArgs) => {
			let actions = [];

			if (!tetrominoExists) {
				actions.push(
					tetrominoActions.spawnTetromino()
				);
			}
			else if (tetrominoShouldLand) {
				actions.push(
					gameActions.mergeTetromino({ tetromino }),
					gameActions.renderScreen({ tetromino })
				);
			}
			else {
				actions.push(
					tetrominoActions.moveTetrominoDown()
				);
			}

			return actions;
		}),
		concatMap(actions => actions)
	));

	onTetrominoSpawned = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.tetrominoSpawned),
		concatLatestFrom(() => [
			this.store.select(fromTetromino.selectTetromino)
		]),
		map(args => args[1]),
		switchMap((tetromino) => [
			gameActions.renderScreen({ tetromino })
		])
	));

	onMergeTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.mergeTetromino),
		switchMap(() => [
			tetrominoActions.clearTetromino()
		])
	));

	onUnableToSpawnTetromino$ = createEffect(() => this.actions$.pipe(
		ofType(tetrominoActions.unableToSpawnTetromino),
		switchMap(() => [
			gameActions.gameOver()
		])
	));

	onTetrominoMoveAttempted = createEffect(() => this.actions$.pipe(
		ofType(
			tetrominoActions.tetrominoMoved,
			tetrominoActions.tetrominoCollidedDuringMove
		),
		concatLatestFrom(() => [
			this.store.select(fromTetromino.selectTetromino)
		]),
		map(args => {
			const [ action, tetromino ] = args;

			return { action, tetromino };
		}),
		map(({ action, tetromino }) => {
			const actions: Action[] = [];

			if (action.type === tetrominoActions.tetrominoCollidedDuringMove.type) {
				actions.push(gameActions.mergeTetromino({ tetromino }));
			}

			actions.push(gameActions.renderScreen({ tetromino }));

			return actions;
		}),
		switchMap(actions => actions)
	));

	onGameOver$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.gameOver),
		concatLatestFrom(() => [
			this.store.select(fromGame.selectScore),
			this.store.select(fromTetromino.selectTetromino)
		]),
		map(args => {
			const [ action, score, tetromino ] = args;

			return { score, tetromino };
		}),
		tap(({ score, tetromino }) => {
			this.store.dispatch(gameActions.mergeTetromino({ tetromino }));
			alert(`GAME OVER! You scored: ${score}`);
		})
	), { dispatch: false });

	onEraseRows$ = createEffect(() => this.actions$.pipe(
		ofType(gameActions.eraseGivenRows),
		concatLatestFrom(() => [
			this.store.select(fromGame.selectLanded)
		]),
		map(args => {
			const [ action, landed ] = args;
			return { landed: [ ...landed ], completedRows: action.rows };
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

	constructor(
		private actions$: Actions,
		private store: Store<any>
	) { }
}
