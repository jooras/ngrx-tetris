import { Component, OnInit, ChangeDetectionStrategy, HostListener, ɵmarkDirty as markDirty } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { tap } from 'rxjs/operators';

import { gameQueries } from './state/game.feature';
import { fromGame } from './state/game.actions';


@Component({
	selector: 'app-stage',
	template: `
		<div class="stage">
			<div class="flex-row" *ngFor="let cols of screen$ | async">
				<div class="col {{ col ? 'filled' + col : '' }}" *ngFor="let col of cols">
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
				this.store.dispatch(fromGame.rotateTetromino());
				break;
			}
			case 'ArrowDown': {
				this.store.dispatch(fromGame.moveTetrominoDown());
				break;
			}
			case 'ArrowLeft': {
				// this._stage.moveTetromino(TetrominoMove.left);
				break;
			}
			case 'ArrowRight': {
				// this._stage.moveTetromino(TetrominoMove.right);
				break;
			}
		}
	}

	screen$: Observable<number[][]>;

	constructor(
		private store: Store<any>
	) {
		this.subscribeToState();
	}

	ngOnInit(): void {
		this.store.dispatch(
			fromGame.start()
		);
	}

	private subscribeToState() {
		this.screen$ = this.store.select(gameQueries.selectScreen).pipe(
			tap(() => markDirty(this))
		);
	}
}
