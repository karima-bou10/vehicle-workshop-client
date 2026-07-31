import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoriqueInterventionResponse } from '../models/historique.model';
import { InterventionService } from '../services/intervention-service';

@Component({
  selector: 'app-intervention-historique',
  imports: [DatePipe],
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

  protected retourDetail(): void {
    const id = this.interventionId();
    if (id) {
      void this.router.navigate(['/interventions', id]);
      return;
    }

    void this.router.navigate(['/interventions']);
  }
}
