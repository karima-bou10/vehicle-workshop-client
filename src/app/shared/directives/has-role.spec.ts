import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/services/auth-service';
import { HasRole } from './has-role';

@Component({
  standalone: true,
  imports: [HasRole],
  template: `<span *hasRole="'ROLE_MANAGER'">visible</span>`
})
class HostComponent {}

describe('HasRole', () => {
  it('should create an instance', async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            hasAnyRole: () => true
          }
        }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('visible');
  });
});
