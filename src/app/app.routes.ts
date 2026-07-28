import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'interventions'
	},
	{
		path: 'interventions',
		loadChildren: () =>
			import('./features/interventions/interventions.routes').then(
				(module) => module.interventionsRoutes
			)
	},
	{
		path: '**',
		redirectTo: 'interventions'
	}
];
