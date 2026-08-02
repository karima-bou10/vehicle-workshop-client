import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly titre = input('Aucun résultat');
  readonly description = input<string | null>(null);
  /** Libellé du bouton d'action ; masqué si absent. */
  readonly action = input<string | null>(null);

  readonly actionClic = output<void>();
}