import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppComponent } from './app.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { gameFeature } from './state/game.feature';
import { OldFashionedStageComponent } from './old-fashioned-stage.component';
import { StageComponent } from './stage.component';
import { GameEffects } from './state/game.effects';

@NgModule({
	declarations: [ AppComponent, OldFashionedStageComponent, StageComponent ],
	imports: [
		BrowserModule,
		StoreModule.forRoot({ }),
		StoreModule.forFeature(gameFeature),
		EffectsModule.forRoot([ GameEffects ]),
		StoreDevtoolsModule.instrument({
			maxAge: 25,
			logOnly: environment.production
		}) ],
	bootstrap: [ AppComponent ]
})
export class AppModule {
}
