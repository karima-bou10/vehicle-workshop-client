import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinner {
  readonly taille = input<'sm' | 'md' | 'lg'>('md');
  readonly message = input<string | null>(null);
  /** true : occupe toute la zone parente et la centre. */
  readonly pleinePage = input(false);
}