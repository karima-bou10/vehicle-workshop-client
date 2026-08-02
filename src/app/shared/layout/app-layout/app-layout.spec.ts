import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { AppLayout } from './app-layout';
import { AuthService } from '../../../core/services/auth-service';

describe('AppLayout', () => {
  let component: AppLayout;
  let fixture: ComponentFixture<AppLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: { titre: 'Test' } },
            firstChild: null
          }
        },
        {
          provide: AuthService,
          useValue: {
            hasAnyRole: () => true,
            displayName: () => 'Utilisateur',
            initiales: () => 'U',
            currentUser: () => ({ username: 'user', role: 'ROLE_MANAGER' }),
            logout: () => undefined
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
