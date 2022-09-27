import { Component, OnInit, ChangeDetectionStrategy, HostListener, ɵmarkDirty as markDirty } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { tetrisActions, fromTetris } from './state';


@Component({
	selector: 'app-stage',
	template: `
		<div class="score">
			<h3>Score: <span>{{ score$ | async }}</span></h3>
		</div>
		<div class="stage">
			<div class="flex-row" *ngFor="let columns of screen$ | async">
				<div class="col {{ col ? 'filled' + col : '' }}" *ngFor="let col of columns">
				</div>
			</div>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageComponent implements OnInit {
	@HostListener('document:keydown', [ '$event' ])
	keyPressed(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowUp': {
				this.store.dispatch(tetrisActions.tetromino.rotateTetromino());
				break;
			}
			case 'ArrowDown': {
				this.store.dispatch(tetrisActions.tetromino.moveTetrominoDown());
				break;
			}
			case 'ArrowLeft': {
				this.store.dispatch(tetrisActions.tetromino.moveTetrominoLeft());
				break;
			}
			case 'ArrowRight': {
				this.store.dispatch(tetrisActions.tetromino.moveTetrominoRight());
				break;
			}
		}
	}

	score$: Observable<number>;
	screen$: Observable<number[][]>;

	constructor(
		private store: Store<any>
	) {
		this.subscribeToState();
	}

	ngOnInit(): void {
		this.store.dispatch(
			tetrisActions.game.start()
		);
	}

	private subscribeToState() {
		this.score$ = this.store.select(fromTetris.game.selectScore);
		this.screen$ = this.store.select(fromTetris.game.selectScreen)
			.pipe(
				tap(() => markDirty(this))
			);
	}
}
