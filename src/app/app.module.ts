import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppComponent } from './app.component';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { gameFeature } from './state/game.feature';

@NgModule({
	declarations: [ AppComponent ],
	imports: [
		BrowserModule,
		StoreModule.forRoot({ }),
		StoreModule.forFeature(gameFeature),
		EffectsModule.forRoot([]),
		StoreDevtoolsModule.instrument({
			maxAge: 25,
			logOnly: environment.production
		}) ],
	bootstrap: [ AppComponent ]
})
export class AppModule {
}
