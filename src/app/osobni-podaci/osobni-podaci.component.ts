import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-osobni-podaci',
  templateUrl: './osobni-podaci.component.html',
  standalone: true,
})
export class OsobniPodaciComponent {
  slika = signal('');
  imePrezime = signal('Josip Batinić');
  email = signal('josip.batinic9@gmail.com');
  linkedIn = signal('');
  whatsapp = signal('');
  telefon = signal('099/8580-947');

  fields = [
    { label: 'Slika', value: this.slika },
    { label: 'Ime i Prezime', value: this.imePrezime },
    { label: 'Email', value: this.email },
    { label: 'LinkedIn', value: this.linkedIn },
    { label: 'WhatsApp', value: this.whatsapp },
    { label: 'Telefon', value: this.telefon },
  ];

  updateField(field: any, event: Event) {
    const input = event.target as HTMLInputElement;
    field.value.set(input.value);
  }
}