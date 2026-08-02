import {
  ChangeDetectionStrategy, Component, TemplateRef, computed, input, output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { EmptyState } from '../empty-state/empty-state';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

@Component({
  selector: 'app-paginated-table',
  imports: [NgTemplateOutlet, EmptyState, LoadingSpinner],
  templateUrl: './paginated-table.html',
  styleUrl: './paginated-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatedTable<T> {
  readonly colonnes = input.required<TableColumn[]>();
  readonly lignes = input.required<readonly T[]>();

  /** Pagination — index base 0, comme Spring Data. */
  readonly pageIndex = input(0);
  readonly taillePage = input(10);
  readonly totalElements = input(0);

  readonly chargement = input(false);
  readonly messageVide = input('Aucune donnée à afficher');

  /** Template de rendu d'une ligne : reçoit la ligne en $implicit et doit émettre les <td>. */
  readonly ligneTemplate = input<TemplateRef<{ $implicit: T }> | null>(null);

  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalElements() / this.taillePage())),
  );

  readonly premierIndex = computed(() =>
    this.totalElements() === 0 ? 0 : this.pageIndex() * this.taillePage() + 1,
  );

  readonly dernierIndex = computed(() =>
    Math.min((this.pageIndex() + 1) * this.taillePage(), this.totalElements()),
  );

  readonly estPremiere = computed(() => this.pageIndex() === 0);
  readonly estDerniere = computed(() => this.pageIndex() >= this.totalPages() - 1);

  precedent(): void {
    if (!this.estPremiere()) this.pageChange.emit(this.pageIndex() - 1);
  }

  suivant(): void {
    if (!this.estDerniere()) this.pageChange.emit(this.pageIndex() + 1);
  }

  valeur(ligne: T, key: string): unknown {
    return (ligne as Record<string, unknown>)[key];
  }
}