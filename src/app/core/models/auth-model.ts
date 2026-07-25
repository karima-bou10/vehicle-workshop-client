/** Petit modèle Role localisé ici pour éviter les erreurs d'import manquant. */

import { RoleModel } from "./role-model";


export interface LoginRequest {
  username: string;
  password: string;
}

/** Réponse de POST /api/auth/login (AuthController côté Spring Boot). */
export interface LoginResponse {
  token: string;
  type: string;          // "Bearer"
  username: string;
  nom?: string;
  prenom?: string;
  roles: RoleModel[];
}

/** Identité conservée côté client, dérivée de LoginResponse. */
export interface AuthUser {
  username: string;
  nom?: string;
  prenom?: string;
  roles: RoleModel[];
}