import { Routes } from '@angular/router';

export const interventionsRoutes: Routes = [
	{
		path: 'nouveau',
		loadComponent: () =>
			import('./intervention-form/intervention-form').then(
				(module) => module.InterventionForm
			)
	},
	{
		path: ':id',
		loadComponent: () =>
			import('./intervention-detail/intervention-detail').then(
				(module) => module.InterventionDetail
			)
	},
	{
		path: '',
		loadComponent: () =>
			import('./intervention-list/intervention-list').then(
				(module) => module.InterventionList
			)
	}
];
