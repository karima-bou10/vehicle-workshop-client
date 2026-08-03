import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUT_METADATA, StatutIntervention, StatusVariant } from '../../../core/models';
import { getInterventionStatusLabel, normalizeInterventionStatus } from '../../../features/interventions/models/intervention-workflow';

@Component({
  selector: 'app-status-tag',
  templateUrl: './status-tag.html',
  styleUrl: './status-tag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTag {
  readonly statut = input<StatutIntervention | null>(null);
  readonly value = input<string | null>(null);
  readonly libelle = input<string | null>(null);
  readonly ton = input<StatusVariant>('neutral');

  readonly texte = computed(() => {
    const statut = this.statut();
    if (statut) {
      return STATUT_METADATA[statut].label;
    }

    const value = this.value();
    if (value) {
      return getInterventionStatusLabel(value);
    }

    return this.libelle() ?? '—';
  });

  readonly tonEffectif = computed(() => {
    const statut = this.statut();
    if (statut) {
      return STATUT_METADATA[statut].variant;
    }

    const value = this.value();
    if (value) {
      return normalizeInterventionStatus(value).toLowerCase();
    }

    return this.ton();
  });

  readonly classes = computed(() => `status-tag status-tag--${this.tonEffectif()}`);
}
