import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { InterventionDetail } from './intervention-detail';
import { AuthService } from '../../../core/services/auth-service';
import { InterventionService } from '../services/intervention-service';
import { VehiculeService } from '../../vehicules/services/vehicule-service';

describe('InterventionDetail', () => {
  let component: InterventionDetail;
  let fixture: ComponentFixture<InterventionDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterventionDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        },
        {
          provide: InterventionService,
          useValue: {
            getById: () =>
              of({
                id: 1,
                typeIntervention: 'Revision',
                descriptionClient: 'Bruit moteur',
                diagnostic: 'Courroie a verifier',
                statut: 'DEVIS_A_VALIDER',
                priorite: 'HAUTE',
                coutEstime: 150,
                dateDepot: '2026-07-31',
                dateRestitutionPrevue: '2026-08-02',
                dateCloture: '2026-08-03',
                vehiculeId: 12,
                immatriculationVehicule: null,
                mecanicienId: 7,
                nomMecanicien: 'Ali'
              })
          }
        },
        {
          provide: VehiculeService,
          useValue: {
            getVehiculeById: () =>
              of({
                id: 12,
                immatriculationFictive: 'AA-123-BB',
                marque: 'Renault',
                modele: 'Clio',
                annee: 2024,
                kilometrage: 12000,
                clientFictif: 'Client Test'
              })
          }
        },
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({ username: 'conseiller', role: 'ROLE_MANAGER' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display vehicle registration resolved from vehicle service', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('AA-123-BB');
  });

  it('should display vehicle make and model resolved from vehicle service', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Renault Clio');
  });

  it('should display repair transition button when business conditions are met', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Passer en réparation');
  });

  it('should open confirmation panel when clicking Passer en réparation', () => {
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn--primary');
    btn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirmer le passage en réparation');
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('should close confirmation panel on cancel', () => {
    fixture.detectChanges();

    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button.btn--primary');
    btn.click();
    fixture.detectChanges();

    const cancelBtn: HTMLButtonElement = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button')
    ).find((b: HTMLButtonElement) => b.textContent?.trim() === 'Annuler')!;
    cancelBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('textarea')).toBeFalsy();
  });
});