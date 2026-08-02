import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.html',
  styleUrl: './confirmation-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEchap()',
  },
})
export class ConfirmationDialog {
  readonly ouvert = input(false);
  readonly titre = input('Confirmer l\'action');
  readonly message = input('');
  readonly libelleConfirmer = input('Confirmer');
  readonly libelleAnnuler = input('Annuler');
  readonly variante = input<'primary' | 'danger'>('primary');
  readonly enCours = input(false);

  readonly afficherConfirmer = input();
  /** Mode alerte */
  readonly modeAlert = input(false);

  readonly confirmer = output<void>();
  readonly annuler = output<void>();

  onEchap(): void {
    if (this.ouvert() && !this.enCours()) this.annuler.emit();
  }
}