import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoriqueInterventionResponse } from '../models/historique.model';
import { InterventionService } from '../services/intervention-service';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { LoadingSpinner } from '../../../shared/ui/loading-spinner/loading-spinner';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

@Component({
  selector: 'app-intervention-historique',
  imports: [PaginatedTable, LoadingSpinner, EmptyState],
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
    { key: 'date',          label: 'Date' },
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
        if (response.length > 0) {
          console.log('[historique] premier enregistrement reçu:', response[0]);
          console.log('[historique] clés disponibles:', Object.keys(response[0]));
        }
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

  protected retourDetail(): void {
    const id = this.interventionId();
    if (id) {
      void this.router.navigate(['/interventions', id]);
      return;
    }

    void this.router.navigate(['/interventions']);
  }

  protected auteurLabel(entry: HistoriqueInterventionResponse): string {
    return entry.username?.trim() || entry.auteurUsername?.trim() || entry.auteur?.trim() || '—';
  }

  protected dateLabel(entry: HistoriqueInterventionResponse): string {
    // Essaie tous les nommages possibles envoyés par le backend
    const rawDate =
      entry.date ??
      entry.dateModification ??
      entry.dateChangement ??
      entry.dateCreation ??
      entry.dateAction ??
      entry.createdAt ??
      entry.horodatage ??
      entry.changedAt ??
      entry.timestamp ??
      this.findDateField(entry);

    if (!rawDate) {
      return '—';
    }

    const parsedDate = this.parseHistoryDate(rawDate);
    if (!parsedDate) {
      console.warn('[historique] date non parsée:', rawDate);
      return '—';
    }

    return parsedDate.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /** Cherche dynamiquement un champ contenant "date" ou "time" dans la réponse brute */
  private findDateField(entry: HistoriqueInterventionResponse): string | null {
    const raw = entry as unknown as Record<string, unknown>;
    for (const key of Object.keys(raw)) {
      const lk = key.toLowerCase();
      if ((lk.includes('date') || lk.includes('time') || lk.includes('heure')) && typeof raw[key] === 'string') {
        console.log(`[historique] champ date trouvé dynamiquement: "${key}" =`, raw[key]);
        return raw[key] as string;
      }
    }
    console.warn('[historique] aucun champ date trouvé dans:', raw);
    return null;
  }

  private parseHistoryDate(rawDate: string): Date | null {
    const normalizedDate = rawDate.trim();
    if (!normalizedDate) {
      return null;
    }

    const parsedDate = new Date(normalizedDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    if (normalizedDate.includes(' ')) {
      const parsedWithIsoSeparator = new Date(normalizedDate.replace(' ', 'T'));
      if (!Number.isNaN(parsedWithIsoSeparator.getTime())) {
        return parsedWithIsoSeparator;
      }
    }

    const localDateTimeMatch = normalizedDate.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
    );
    if (!localDateTimeMatch) {
      return null;
    }

    const [, year, month, day, hour, minute, second = '0'] = localDateTimeMatch;
    const parsedLocalDateTime = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );

    return Number.isNaN(parsedLocalDateTime.getTime()) ? null : parsedLocalDateTime;
  }
}
