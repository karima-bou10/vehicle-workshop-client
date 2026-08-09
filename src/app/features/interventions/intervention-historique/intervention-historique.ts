import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoriqueInterventionResponse } from '../models/historique.model';
import { InterventionService } from '../services/intervention-service';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-intervention-historique',
  imports: [DatePipe, PaginatedTable, LoadingSpinner, EmptyState],
  templateUrl: './intervention-historique.html',
  styleUrl: './intervention-historique.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionHistorique implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly interventionService = inject(InterventionService);

  readonly history = signal<HistoriqueInterventionResponse[]>([]);
  readonly interventionId = signal<number | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly columns: TableColumn[] = [
    { key: 'dateModification', label: 'Date' },
    { key: 'auteur',        label: 'Auteur' },
    { key: 'ancienStatut',  label: 'Ancien statut' },
    { key: 'nouveauStatut', label: 'Nouveau statut' },
    { key: 'commentaire',   label: 'Commentaire' },
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const interventionId = Number(idParam);

    if (!idParam || Number.isNaN(interventionId)) {
      this.errorMessage.set("Identifiant d'intervention invalide.");
      this.loading.set(false);
      return;
    }

    this.interventionId.set(interventionId);
    this.interventionService.getHistory(interventionId).subscribe({
      next: (response) => {
        this.history.set(response);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load intervention history.', error);
        this.errorMessage.set("Impossible de charger l'historique.");
        this.loading.set(false);
      }
    });
  }

  protected retourListIntervention(): void {
    void this.router.navigate(['/interventions']);
  }
}
