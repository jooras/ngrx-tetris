import { Component, OnInit, ChangeDetectionStrategy, HostListener, ɵmarkDirty as markDirty } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { fromGame } from './state/game.feature';
import { gameActions } from './state/game.actions';


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
				this.store.dispatch(gameActions.rotateTetromino());
				break;
			}
			case 'ArrowDown': {
				this.store.dispatch(gameActions.moveTetrominoDown());
				break;
			}
			case 'ArrowLeft': {
				this.store.dispatch(gameActions.moveTetrominoLeft());
				break;
			}
			case 'ArrowRight': {
				this.store.dispatch(gameActions.moveTetrominoRight());
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
			gameActions.start()
		);
	}

	private subscribeToState() {
		this.score$ = this.store.select(fromGame.selectScore);
		this.screen$ = this.store.select(fromGame.selectScreen)
			.pipe(
				tap(() => markDirty(this))
			);
	}
}
