import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Page, emptyPage } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification-service';
import { ConfirmationDialog } from '../../../shared/ui/confirmation-dialog/confirmation-dialog';
import { PaginatedTable, TableColumn } from '../../../shared/ui/paginated-table/paginated-table';
import { Mecanicien } from '../models/mecanicien.model';
import { MecanicienService } from '../services/mecanicien-service';

const TAILLE_PAGE = 10;
@Component({
  selector: 'app-mecanicien-list',
  imports: [RouterLink, PaginatedTable, ConfirmationDialog, ReactiveFormsModule],
  templateUrl: './mecanicien-list.html',
  styleUrl: './mecanicien-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MecanicienList {
  private readonly service = inject(MecanicienService);
  private readonly notif = inject(NotificationService);

  readonly page = signal<Page<Mecanicien>>(emptyPage<Mecanicien>(TAILLE_PAGE));
  readonly chargement = signal(false);
  readonly aSupprimer = signal<Mecanicien | null>(null);
  readonly suppressionEnCours = signal(false);
  readonly afficherDisponibles = signal(false);

  readonly search = new FormControl('', { nonNullable: true });
  currentPage = 0;

  readonly colonnes: TableColumn[] = [
    { key: 'nom', label: 'Mécanicien' },
    { key: 'specialite', label: 'Spécialité' },
    { key: 'etat', label: 'État', width: '120px' },
    { key: 'interventions', label: 'Interventions', width: '130px', align: 'center' },
    { key: 'actions', label: '', width: '90px', align: 'right' },
  ];

  readonly nbInterventions = computed(() => this.aSupprimer()?.interventions.length ?? 0);
  
  readonly estSupprimable = computed(() => this.nbInterventions() === 0);

  readonly dialogTitre = computed(() =>
    this.estSupprimable() ? 'Retirer le mécanicien' : 'Suppression Impossible'
  );

  readonly dialogMessage = computed(() => {
    const m = this.aSupprimer();
    if (!m) return '';

    if (this.estSupprimable()) {
      return `${m.prenom} ${m.nom} n'est actuellement affecté à aucune intervention. Confirmez-vous son retrait de l'équipe ?`;
    }
    return `${m.prenom} ${m.nom} est actuellement affecté à ${this.nbInterventions()} interventions. Veuillez le déaffecter de ces interventions avant de le retirer de l'équipe.`;
  });
  
  constructor() {
    this.charger('');

    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(keyword => {
        this.currentPage = 0;
        this.charger(keyword || '');
      });
  }

  charger(keyword: string = ''): void {
    this.chargement.set(true);

    // Désactiver le filtre "disponibles" si l'utilisateur lance une recherche texte
    if (keyword && this.afficherDisponibles()) {
      this.afficherDisponibles.set(false);
    }

    let request$;
    if (keyword) {
      request$ = this.service.rechercher(keyword, this.currentPage, TAILLE_PAGE);
    } else if (this.afficherDisponibles()) {
      request$ = this.service.disponibles(this.currentPage, TAILLE_PAGE);
    } else {
      request$ = this.service.lister(this.currentPage, TAILLE_PAGE);
    }

    request$.subscribe({
      next: page => { 
        this.page.set(page); 
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  toggleDisponibles(): void {
    this.afficherDisponibles.set(!this.afficherDisponibles());
    this.currentPage = 0;
    
    // Si on active le filtre "disponibles", on efface la barre de recherche
    if (this.afficherDisponibles()) {
      this.search.setValue('', { emitEvent: false });
    }
    
    this.charger(this.search.value);
  }

  onPageChange(nouvellePage: number): void {
    this.currentPage = nouvellePage;
    this.charger(this.search.value);
  }

  confirmerSuppression(): void {
    const m = this.aSupprimer();
    if (!m || !this.aSupprimer()) return;

    this.suppressionEnCours.set(true);

    this.service.supprimer(Number(m.id)).subscribe({
      next: () => {
        this.notif.success(`${m.prenom} ${m.nom} a été retiré de l'équipe.`);
        this.aSupprimer.set(null);
        this.suppressionEnCours.set(false);
        this.currentPage = this.page().number;
        this.charger(this.search.value);
      },
      error: () => {
        this.aSupprimer.set(null);
        this.suppressionEnCours.set(false);
      },
    });
  }
}
