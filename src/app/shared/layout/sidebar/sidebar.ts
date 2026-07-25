import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleModel } from '../../../core/models';
import { AuthService } from '../../../core/services/auth-service';
import { UserMenu } from '../user-menu/user-menu';

interface NavItem {
  libelle: string;
  route: string;
  icone: string;              // chemin SVG
  roles: RoleModel[];
}

const NAV: NavItem[] = [
  {
    libelle: 'Tableau de bord',
    route: '/dashboard',
    icone: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z',
    roles: ['ROLE_USER', 'ROLE_MANAGER'],
  },
  {
    libelle: 'Véhicules',
    route: '/vehicules',
    icone: 'M5 16h14M6.5 16V9.5l1.8-3.5h7.4l1.8 3.5V16M8 19v-3m8 3v-3M3 12h2m14 0h2',
    roles: ['ROLE_USER', 'ROLE_MANAGER'],
  },
  {
    libelle: 'Interventions',
    route: '/interventions',
    icone: 'M14.5 4.5a4 4 0 0 0-5.3 5.3L4 15v5h5l5.2-5.2a4 4 0 0 0 5.3-5.3l-2.7 2.7-2.3-2.3 2.7-2.7Z',
    roles: ['ROLE_USER', 'ROLE_MANAGER'],
  },
  {
    libelle: 'Mécaniciens',
    route: '/mecaniciens',
    icone: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.7a3 3 0 0 1 0 5.8',
    roles: ['ROLE_MANAGER'],
  },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, UserMenu],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly auth = inject(AuthService);

  readonly reduit = input(false);

  /** Le menu se recalcule automatiquement si l'utilisateur change. */
  readonly items = computed(() => NAV.filter(i => this.auth.hasAnyRole(i.roles)));
}