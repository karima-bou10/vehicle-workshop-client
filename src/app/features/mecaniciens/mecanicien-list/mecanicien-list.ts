import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page, emptyPage } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification-service';
import { ConfirmationDialog } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';
import { Mecanicien } from '../models/mecanicien.model';
import { MecanicienService } from '../services/mecanicien-service';

const TAILLE_PAGE = 10;
@Component({
  selector: 'app-mecanicien-list',
  imports: [RouterLink, PaginatedTable, StatusTag, ConfirmationDialog],
  templateUrl: './mecanicien-list.html',
  styleUrl: './mecanicien-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MecanicienList {
  private readonly service = inject(MecanicienService);
  private readonly notif = inject(NotificationService);

  readonly page = signal<Page<Mecanicien>>(emptyPage<Mecanicien>(TAILLE_PAGE));
  readonly chargement = signal(false);
  readonly aSupprimer = signal<Mecanicien | null>(null);
  readonly suppressionEnCours = signal(false);

  readonly colonnes: TableColumn[] = [
    { key: 'nom', label: 'Mécanicien' },
    { key: 'specialite', label: 'Spécialité' },
    { key: 'contact', label: 'Contact' },
    { key: 'charge', label: 'Charge', width: '130px', align: 'center' },
    { key: 'etat', label: 'État', width: '120px' },
    { key: 'actions', label: '', width: '90px', align: 'right' },
  ];

  constructor() {
    this.charger(0);
  }

  charger(index: number): void {
    this.chargement.set(true);

    this.service.lister(index, TAILLE_PAGE).subscribe({
      next: page => { this.page.set(page); this.chargement.set(false); },
      error: () => this.chargement.set(false),
    });
  }

  /** Un mécanicien avec des interventions en cours ne peut pas être retiré. */
  // supprimable(m: Mecanicien): boolean {
  //   return m.nbInterventionsEnCours === 0;
  // }

  confirmerSuppression(): void {
    const m = this.aSupprimer();
    if (!m) return;

    this.suppressionEnCours.set(true);

    this.service.supprimer(m.id).subscribe({
      next: () => {
        this.notif.success(`${m.prenom} ${m.nom} a été retiré de l'équipe.`);
        this.aSupprimer.set(null);
        this.suppressionEnCours.set(false);
        this.charger(this.page().number);
      },
      error: () => {
        this.aSupprimer.set(null);
        this.suppressionEnCours.set(false);
      },
    });
  }
}
