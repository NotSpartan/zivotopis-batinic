import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ciljevi-motivacija',
  templateUrl: './ciljevi-motivacija.component.html',
  standalone: true,
})
export class CiljeviMotivacijaComponent {
  ciljevi = signal('Aktivno tražim poslodavca kod kojeg ću moći unaprijediti novostečene vještine.');

  updateCiljevi(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.ciljevi.set(input.value);
  }
}