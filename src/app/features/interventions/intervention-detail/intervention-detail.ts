import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Intervention } from '../models/intervention.model';
import { InterventionService } from '../services/intervention-service';

type Tab = 'info' | 'notes' | 'pieces';

@Component({
  selector: 'app-intervention-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './intervention-detail.html',
  styleUrl: './intervention-detail.scss',
})
export class InterventionDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly interventionService = inject(InterventionService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly intervention = signal<Intervention | null>(null);
  protected readonly activeTab = signal<Tab>('info');

  protected readonly title = computed(() => {
    const item = this.intervention();

    if (!item) {
      return 'Detail intervention';
    }

    return item.reference ? `${item.reference}` : `Intervention #${item.id}`;
  });

  constructor() {
    this.loadIntervention();
  }

  protected setTab(tab: Tab): void {
    this.activeTab.set(tab);
  }

  protected retry(): void {
    this.loadIntervention();
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

  private loadIntervention(): void {
    const rawId = this.route.snapshot.paramMap.get('id');

    if (!rawId) {
      this.loading.set(false);
      this.error.set('ID intervention manquant dans l\'URL.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.interventionService
      .getInterventionById(rawId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (item) => this.intervention.set(item),
        error: () => {
          this.intervention.set(null);
          this.error.set('Impossible de charger le detail de l\'intervention.');
        }
      });
  }

}
