import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { STATUT_METADATA, StatutIntervention, StatusVariant } from '../../../core/models';
import { NotificationTon } from '../../../core/services/notification-service';

@Component({
  selector: 'app-status-tag',
  templateUrl: './status-tag.html',
  styleUrl: './status-tag.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusTag {
  readonly statut = input<StatutIntervention | null>(null);

  readonly libelle = input<string | null>(null);
  readonly ton = input<StatusVariant>('neutral');

  readonly texte = computed(() => {
    const s = this.statut();
    return s ? STATUT_METADATA[s].label : (this.libelle() ?? '—');
  });

  readonly tonEffectif = computed(() => {
    const s = this.statut();
    return s ? STATUT_METADATA[s].variant : this.ton();
  });
}