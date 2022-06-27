import { Component, HostListener, OnInit, ɵmarkDirty as markDirty } from '@angular/core';

import { Stage } from './stage';
import { TetrominoMove } from './models';


@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	providers: [ Stage ],
	styles: [ ]
})
export class AppComponent implements OnInit {
	@HostListener('document:keydown', [ '$event' ])
	keyPressed(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowUp': {
				this._stage.moveTetromino(TetrominoMove.rotate);
				break;
			}
			case 'ArrowDown': {
				this._stage.moveTetromino(TetrominoMove.down);
				break;
			}
			case 'ArrowLeft': {
				this._stage.moveTetromino(TetrominoMove.left);
				break;
			}
			case 'ArrowRight': {
				this._stage.moveTetromino(TetrominoMove.right);
				break;
			}
		}

		this.rows = this._stage.render();
		markDirty(this);
	}

	rows: number[][] = [];

	constructor(
		private _stage: Stage
	) { }

	ngOnInit() {
		this._stage.initialize();
		this._stage.spawnTetromino();

		const loop = setInterval(() => {			
			this.rows = this._stage.render();
			markDirty(this);

			try {
				this._stage.tick();
			}
			catch(err) {
				clearInterval(loop);

				this.rows = this._stage.render();
				markDirty(this);

				console.error('GAME OVER') // TODO
			}
		}, 600);
	}
}
