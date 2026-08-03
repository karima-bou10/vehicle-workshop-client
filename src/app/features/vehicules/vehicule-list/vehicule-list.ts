import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Page, emptyPage } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification-service';
import { HasRole } from '../../../shared/directives/has-role';
import { KilometragePipe } from '../../../shared/pipes/kilometrage.pipe';
import { ConfirmationDialog } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { VehiculeService } from '../services/vehicule-service';
import { VehiculeModel } from '../models/vehicule-model';
import { InterventionService } from '../../interventions/services/intervention-service';

@Component({
  selector: 'app-vehicule-list',
  imports: [ReactiveFormsModule, RouterLink, PaginatedTable, ConfirmationDialog, HasRole, KilometragePipe],
  templateUrl: './vehicule-list.html',
  styleUrls: ['./vehicule-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiculeList {
  private readonly vehiculeService = inject(VehiculeService);
  private readonly interventionService = inject(InterventionService);
  private readonly notif = inject(NotificationService);
  private readonly router = inject(Router);

  readonly PAGE_SIZE = 10;

  readonly page = signal<Page<VehiculeModel>>(emptyPage<VehiculeModel>(this.PAGE_SIZE));
  readonly loading = signal(false);
  readonly toDelete = signal<VehiculeModel | null>(null);
  readonly deleting = signal(false);

  readonly verification = signal(false);
  readonly alertMessage = signal('');
  readonly openAlert = signal(false);

  readonly search = new FormControl('', { nonNullable: true });

  readonly columns: TableColumn[] = [
    { key: 'immatriculationFictive', label: 'Immatriculation fictive', width: '140px' },
    { key: 'marque', label: 'Marque' },
    { key: 'clientFictif', label: 'Client fictif' },
    { key: 'modele', label: 'Modèle' },
    { key: 'annee', label: 'Année' },
    { key: 'kilometrage', label: 'Kilométrage', width: '120px', align: 'right' },
    //{ key: 'interventions', label: 'Interventions', width: '90px', align: 'center' },
    { key: 'actions', label: 'actions', width: '90px', align: 'right' },
  ];

  constructor() {
    this.load(0);

    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.load(0));
  }

  load(index: number): void {
    this.loading.set(true);

    this.vehiculeService
      .getAllVehicules({ page: index, size: this.PAGE_SIZE, search: this.search.value })
      .subscribe({
        next: (page) => {
          this.page.set(page);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  open(v: VehiculeModel): void {
    this.router.navigate(['/vehicules', v.id]);
  }

  requestDelete(v: VehiculeModel, event: MouseEvent): void {
    event.stopPropagation();
    this.verification.set(true);
    this.interventionService.listInterventionsByVehiculeId(v.id).subscribe({
      next: (interventions) => {
        this.verification.set(false);
        if(interventions.length === 0) {
          this.toDelete.set(v);
        } else {
          this.alertMessage.set(`Le véhicule ${v.immatriculationFictive} a ${interventions.length} intervention(s) associées et ne peut pas être supprimé.`);
          this.openAlert.set(true);
        }

      },
      error: () => {
        this.verification.set(false);
      }
    });
  }

  confirmDelete(): void {
    const v = this.toDelete();
    if (!v) return;

    this.deleting.set(true);

    this.vehiculeService.deleteVehicule(v.id).subscribe({
      next: () => {
        this.notif.success(`Véhicule ${v.immatriculationFictive} supprimé.`);
        this.deleting.set(false);
        this.toDelete.set(null);
        this.load(this.page().number);
      },
      error: () => {
        this.deleting.set(false);
        this.toDelete.set(null);
      },
    });
  }
}