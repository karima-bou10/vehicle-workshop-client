import { Component, ChangeDetectionStrategy, inject, input, numberAttribute, signal, effect } from "@angular/core";
import type { Mecanicien } from "../models/mecanicien.model";
import { RouterLink } from "@angular/router";
import { EmptyState } from "../../../shared/ui/empty-state/empty-state";
import { LoadingSpinner } from "../../../shared/ui/loading-spinner/loading-spinner";
import { StatusTag } from "../../../shared/ui/status-tag/status-tag";
import { InterventionService } from "../../interventions/services/intervention-service";
import { MecanicienService } from "../services/mecanicien-service";
import { InterventionModel } from "../../interventions/models/intervention-model";
import { PaginatedTable, TableColumn } from "../../../shared/ui/paginated-table/paginated-table";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-mecanicien-detail',
  imports: [RouterLink, EmptyState, LoadingSpinner, StatusTag, DatePipe, PaginatedTable],
  templateUrl: './mecanicien-detail.html',
  styleUrls: ['./mecanicien-detail.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MecanicienDetail {
  private readonly service = inject(MecanicienService);
  private readonly interventionService = inject(InterventionService);

  readonly id = input.required({ transform: numberAttribute });

  readonly mecanicien = signal<Mecanicien | null>(null);
  readonly interventions = signal<InterventionModel[]>([]);
  readonly loading = signal(true);

  readonly columns: TableColumn[] = [
      { key: 'id',                     label: 'Numéro', align: 'left', width: '80px' },
      { key: 'typeIntervention',       label: 'Type', align: 'left' },
      { key: 'statut',                 label: 'Statut', align: 'left' },
      { key: 'priorite',               label: 'Priorité', align: 'left' },
      { key: 'marque',                 label: 'Marque Véhicule', align: 'left' },
      { key: 'dateDepot',              label: 'Date dépôt', align: 'left' },
      { key: 'coutEstime',             label: 'Coût estimé', align: 'right' },
    ];

  constructor() {
    effect(() => {
      const id = this.id();
      this.loading.set(true);

      this.service.parId(id).subscribe({
        next: m => {
          this.mecanicien.set(m);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

      this.interventionService.listInterventionsByMecanicienId(id).subscribe({
        next: liste => this.interventions.set(liste),
      });
    });
  }
}
