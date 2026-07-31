import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { InterventionService } from '../services/intervention-service';
import { InterventionResponse } from '../models/intervention.model';
import { StatusTag } from '../../../shared/ui/status-tag/status-tag';

@Component({
  selector: 'app-intervention-list',
  imports: [DatePipe, StatusTag],
  templateUrl: './intervention-list.html',
  styleUrl: './intervention-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InterventionList implements OnInit {
  private readonly interventionService = inject(InterventionService);
  private readonly router = inject(Router);

  readonly interventions = signal<InterventionResponse[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadInterventions();
  }

  private loadInterventions(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.interventionService.getAll().subscribe({
      next: (response: InterventionResponse[]) => {
        this.interventions.set(response);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load interventions.', error);
        this.errorMessage.set('Impossible de charger les interventions.');
        this.loading.set(false);
      }
    });
  }

  voirDetail(id: number): void {
    void this.router.navigate(['/interventions', id]);
  }

  creerIntervention(): void {
    void this.router.navigate(['/interventions/new']);
  }

  allerDiagnostic(id: number): void {
    void this.router.navigate(['/interventions', id, 'diagnostic']);
  }

  allerAffectation(id: number): void {
    void this.router.navigate(['/interventions', id, 'affectation']);
  }

  voirHistorique(id: number): void {
    void this.router.navigate(['/interventions', id, 'historique']);
  }
}