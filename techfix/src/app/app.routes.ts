import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'TechFix — Step-by-step tech help',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'categories',
    title: 'Categories · TechFix',
    loadComponent: () =>
      import('./features/categories/category-list.component').then((m) => m.CategoryListComponent),
  },
  {
    path: 'categories/:slug',
    title: 'Category · TechFix',
    loadComponent: () =>
      import('./features/categories/category-detail.component').then(
        (m) => m.CategoryDetailComponent,
      ),
  },
  {
    path: 'guides',
    title: 'Browse problems · TechFix',
    data: { mode: 'browse' },
    loadComponent: () =>
      import('./features/guides/guide-browse.component').then((m) => m.GuideBrowseComponent),
  },
  {
    path: 'guides/:slug',
    title: 'Guide · TechFix',
    loadComponent: () =>
      import('./features/guides/guide-detail.component').then((m) => m.GuideDetailComponent),
  },
  {
    path: 'search',
    title: 'Search results · TechFix',
    data: { mode: 'search' },
    loadComponent: () =>
      import('./features/guides/guide-browse.component').then((m) => m.GuideBrowseComponent),
  },
  {
    path: 'diagnose',
    title: 'Guided diagnosis · TechFix',
    loadComponent: () =>
      import('./features/diagnostics/diagnose-list.component').then((m) => m.DiagnoseListComponent),
  },
  {
    path: 'diagnose/:flowId',
    title: 'Diagnose · TechFix',
    loadComponent: () =>
      import('./features/diagnostics/diagnose.component').then((m) => m.DiagnoseComponent),
  },
  {
    path: 'bookmarks',
    title: 'Bookmarks · TechFix',
    loadComponent: () =>
      import('./features/bookmarks/bookmarks.component').then((m) => m.BookmarksComponent),
  },
  {
    path: 'about',
    title: 'About · TechFix',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: '**',
    title: 'Page not found · TechFix',
    loadComponent: () =>
      import('./features/about/not-found.component').then((m) => m.NotFoundComponent),
  },
];
