import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, ChangeDetectionStrategy, inject, input, numberAttribute, signal, effect } from "@angular/core";
import type { TableColumn } from "../../../shared/ui/paginated-table/paginated-table";
import { PaginatedTable } from "../../../shared/ui/paginated-table/paginated-table";
import type { VehiculeModel } from "../models/vehicule-model";
import { RouterLink } from "@angular/router";
import { EmptyState } from "../../../shared/ui/empty-state/empty-state";
import { LoadingSpinner } from "../../../shared/ui/loading-spinner/loading-spinner";
import { StatusTag } from "../../../shared/ui/status-tag/status-tag";
import { InterventionService } from "../../interventions/services/intervention-service";
import { VehiculeService } from "../services/vehicule-service";
import { InterventionModel } from "../../interventions/models/intervention-model";

@Component({
  selector: 'app-vehicule-detail',
  imports: [RouterLink, DatePipe, DecimalPipe, StatusTag, EmptyState, LoadingSpinner, PaginatedTable],
  templateUrl: './vehicule-detail.html',
  styleUrls: ['./vehicule-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiculeDetail {
  private readonly service = inject(VehiculeService);
  private readonly interventionService = inject(InterventionService);

  readonly id = input.required({ transform: numberAttribute });

  readonly vehicule = signal<VehiculeModel | null>(null);
  readonly interventions = signal<InterventionModel[]>([]);
  readonly loading = signal(true);

  readonly columns: TableColumn[] = [
      { key: 'id',                     label: 'Numéro', align: 'left', width: '80px' },
      { key: 'typeIntervention',       label: 'Type', align: 'left' },
      { key: 'statut',                 label: 'Statut', align: 'left' },
      { key: 'priorite',               label: 'Priorité', align: 'left' },
      { key: 'nomMecanicien',          label: 'Mécanicien', align: 'left' },
      { key: 'dateDepot',              label: 'Date dépôt', align: 'left' },
      { key: 'coutEstime',             label: 'Coût estimé', align: 'right' },
    ];

  constructor() {
    effect(() => {
      const id = this.id();
      this.loading.set(true);

      this.service.getVehiculeById(id).subscribe({
        next: v => {
          this.vehicule.set(v);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

      this.interventionService.listInterventionsByVehiculeId(id).subscribe({
        next: liste => this.interventions.set(liste),
      });
    });
  }
}