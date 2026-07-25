import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { ROLE_LABELS } from '../../../core/models';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'fermer()',
    '(document:keydown.escape)': 'fermer()',
  },
})
export class UserMenu {
  private readonly auth = inject(AuthService);

  readonly reduit = input(false);

  readonly ouvert = signal(false);
  readonly nom = this.auth.displayName;
  readonly initiales = this.auth.initiales;

  readonly roleLibelle = () => {
    const u = this.auth.currentUser();
    if (!u) return '';
    return u.roles.includes('ROLE_MANAGER')
      ? ROLE_LABELS.ROLE_MANAGER
      : ROLE_LABELS.ROLE_USER;
  };

  basculer(event: MouseEvent): void {
    event.stopPropagation();
    this.ouvert.update(v => !v);
  }

  fermer(): void {
    if (this.ouvert()) this.ouvert.set(false);
  }

  deconnexion(): void {
    this.fermer();
    this.auth.logout();
  }
}