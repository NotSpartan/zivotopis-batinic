import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-osobni-podaci',
  templateUrl: './osobni-podaci.component.html',
  styleUrls: ['./osobni-podaci.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class OsobniPodaciComponent {
  slika = signal('');
  imePrezime = signal('Josip Batinić');
  email = signal('josip.batinic9@gmail.com');
  linkedIn = signal('');
  whatsapp = signal('');
  telefon = signal('099/8580-947');
  isEditing = signal(false);
  isAuthor = signal(true); // Pretpostavimo da je autor

  fields = computed(() => [
    { label: 'Slika', value: this.slika },
    { label: 'Ime i Prezime', value: this.imePrezime },
    { label: 'Email', value: this.email },
    { label: 'LinkedIn', value: this.linkedIn },
    { label: 'WhatsApp', value: this.whatsapp },
    { label: 'Telefon', value: this.telefon },
  ]);

  updateField(field: any, event: Event) {
    const input = event.target as HTMLInputElement;
    field.value.set(input.value);
  }

  toggleEdit() {
    if (this.isAuthor()) {
      this.isEditing.set(!this.isEditing());
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.slika.set(e.target.result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
