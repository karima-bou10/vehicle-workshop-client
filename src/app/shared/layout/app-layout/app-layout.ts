import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly sidebarReduite = signal(false);

  /** Titre affiché dans le header : `data: { titre: '…' }` de la route la plus profonde. */
  readonly titrePage = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.titreRouteActive()),
    ),
    { initialValue: '' },
  );

  basculerSidebar(): void {
    this.sidebarReduite.update(v => !v);
  }

  private titreRouteActive(): string {
    let r = this.route;
    while (r.firstChild) r = r.firstChild;
    return r.snapshot?.data['titre'] ?? '';
  }
}