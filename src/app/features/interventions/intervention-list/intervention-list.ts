import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Intervention } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';

@Component({
  selector: 'app-intervention-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './intervention-list.html',
  styleUrl: './intervention-list.scss',
})
export class InterventionList {
  private readonly destroyRef = inject(DestroyRef);
  private readonly interventionService = inject(InterventionService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly interventions = signal<Intervention[]>([]);
  protected readonly displayedInterventions = computed(() =>
    [...this.interventions()].sort(compareInterventions)
  );

  constructor() {
    this.loadInterventions();
  }

  protected retry(): void {
    this.loadInterventions();
  }

  protected trackByIntervention(_: number, intervention: Intervention): number | string {
    return intervention.id;
  }

  protected formatLabel(value: string): string {
    return value
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  protected badgeClass(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  private loadInterventions(): void {
    this.loading.set(true);
    this.error.set(null);

    this.interventionService
      .getInterventions()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (interventions) => this.interventions.set(interventions),
        error: () => {
          this.interventions.set([]);
          this.error.set('Impossible de charger la liste des interventions.');
        }
      });
  }
}

function compareInterventions(left: Intervention, right: Intervention): number {
  const priorityDelta = priorityWeight(right.priority) - priorityWeight(left.priority);

  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  const leftDue = left.dueAt ? new Date(left.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  const rightDue = right.dueAt ? new Date(right.dueAt).getTime() : Number.MAX_SAFE_INTEGER;

  return leftDue - rightDue;
}

function priorityWeight(priority: string): number {
  switch (priority.toUpperCase()) {
    case 'CRITIQUE':
    case 'CRITICAL':
    case 'URGENTE':
      return 4;
    case 'HAUTE':
    case 'HIGH':
      return 3;
    case 'MOYENNE':
    case 'MEDIUM':
    case 'NORMALE':
      return 2;
    case 'BASSE':
    case 'LOW':
      return 1;
    default:
      return 0;
  }

}
