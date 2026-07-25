import { RoleModel } from './role-model';

export interface UserModel {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  roles: RoleModel[];
}