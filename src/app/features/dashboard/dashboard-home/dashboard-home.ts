import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../services/dashboard-service';
import { DashboardResume, ChargeMecanicien } from '../models/dashboard-model';
import { LoadingSpinner } from "../../../shared/ui/loading-spinner/loading-spinner";
import { EmptyState } from "../../../shared/ui/empty-state/empty-state";
import { HasRole } from '../../../shared/directives/has-role';
import { AuthService } from '../../../core/services/auth-service';
import { STATUT_METADATA } from "../../../core/models";

/** Résout une variable CSS (--primary) en sa valeur calculée (hex), pour Chart.js. */
function cssVar(nom: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
}
@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LoadingSpinner, EmptyState, HasRole],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DashboardHome {
  private readonly dashboardService = inject(DashboardService);
  private readonly auth = inject(AuthService);

  readonly nom = this.auth.displayName;

  readonly resume = signal<DashboardResume | null>(null);
  readonly charges = signal<ChargeMecanicien[]>([]);
  readonly chargement = signal(true);

  // Configuration du graphique Donut : répartition par statut
  readonly donutData = computed<ChartData<'doughnut', number[], string>>(() => {
    const r = this.resume();
    const items = (r?.repartitionStatuts ?? []).filter(x => x.nombre > 0);
    return {
      labels: items.map(x => STATUT_METADATA[x.statut].label),
      datasets: [{
        data: items.map(x => x.nombre),
        backgroundColor: items.map(x => cssVar('--'+STATUT_METADATA[x.statut].variant)),  // couleur du statut
        borderColor: cssVar('--surface'),
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  });

  readonly donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, padding: 14, font: { size: 12 } } },
      tooltip: { callbacks: { label: c => ` ${c.label} : ${c.parsed}` } },
    }
  };

    readonly donutVide = computed(() => this.donutData().labels?.length === 0);

  // Configuration du graphique Barres : charge par mécanicien
  readonly barData = computed<ChartData<'bar', number[], string>>(() => {
    const c = this.charges();
    return {
      labels: c.map(x => x.mecanicienNom),
      datasets: [{
        label: 'Interventions en cours',
        data: c.map(x => x.nombreInterventionsActives),
        backgroundColor: cssVar('--primary'),
        borderRadius: 4,
        barThickness: 18,
      }],
    };
  });

  readonly barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Barres horizontales
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 }, grid: { display: true } },
      y: { grid: { display: false } },
    },
  };

  constructor() {
    this.chargerDonnees();
  }

  private chargerDonnees(): void {
    this.chargement.set(true);
    
    forkJoin({
      resumeData: this.dashboardService.getResume(),
      chargesData: this.dashboardService.getChargeMecaniciens()
    }).subscribe({
      next: ({ resumeData, chargesData }) => {
        this.resume.set(resumeData);
        this.charges.set(chargesData as ChargeMecanicien[]);
        this.chargement.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du dashboard', err);
        this.chargement.set(false);
      }
    });
  }
}
