import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification-service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  private readonly service = inject(NotificationService);
  readonly notifications = this.service.notifications;

  fermer(id: number): void {
    this.service.dismiss(id);
  }
}