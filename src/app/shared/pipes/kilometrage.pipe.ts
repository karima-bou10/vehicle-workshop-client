import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kilometrage',
})
export class KilometragePipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('fr-FR');

  transform(value: number | null | undefined): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '0';
    }

    return this.formatter.format(value);
  }
}
