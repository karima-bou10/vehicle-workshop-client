import {
  Directive, TemplateRef, ViewContainerRef, effect, inject, input,
} from '@angular/core';
import { RoleModel } from '../../core/models';
import { AuthService } from '../../core/services/auth-service';

@Directive({
  selector: '[hasRole]',
})
export class HasRole {
  private readonly tpl = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  /** *hasRole="'ROLE_MANAGER'"  ou  *hasRole="['ROLE_MANAGER','ROLE_USER']" */
  readonly hasRole = input.required<RoleModel | RoleModel[]>();

  private affiche = false;

  constructor() {
    effect(() => {
      const valeur = this.hasRole();
      const roles = Array.isArray(valeur) ? valeur : [valeur];
      const autorise = this.auth.hasAnyRole(roles);

      if (autorise && !this.affiche) {
        this.vcr.createEmbeddedView(this.tpl);
        this.affiche = true;
      } else if (!autorise && this.affiche) {
        this.vcr.clear();
        this.affiche = false;
      }
    });
  }
}