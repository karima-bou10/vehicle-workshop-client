import { DatePipe, DecimalPipe } from "@angular/common";
import { Component, ChangeDetectionStrategy, inject, input, numberAttribute, signal, effect } from "@angular/core";
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
  imports: [RouterLink, DatePipe, DecimalPipe, StatusTag, EmptyState, LoadingSpinner],
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

      // TODO: Add parVehicule method to InterventionService
      // this.interventionService.parVehicule(id).subscribe({
      //   next: (liste: any[]) => this.interventions.set(liste),
      // });
    });
  }
}