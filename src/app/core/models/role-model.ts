export type RoleModel = 'ROLE_USER' | 'ROLE_MANAGER';

export const ROLE_LABELS: Record<RoleModel, string> = {
  ROLE_USER: 'Conseiller atelier',
  ROLE_MANAGER: 'Responsable atelier',
};