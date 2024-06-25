import { Component, signal, computed, inject, WritableSignal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

interface Field {
  icon: string;
  value: WritableSignal<string>;
  type: 'text' | 'email' | 'tel';
  placeholder: string; 
}

interface SocialLink {
  platform: string;
  url: string;
}

@Component({
  selector: 'app-osobni-podaci',
  templateUrl: './osobni-podaci.component.html',
  styleUrls: ['./osobni-podaci.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class OsobniPodaciComponent {
  private authService = inject(AuthService);
  private dataService = inject(DataService);

  slika = signal('assets/default-profile.png');
  imePrezime = signal('Josip Batinić');
  titula = signal('Software Developer');
  email = signal('josip.batinic9@gmail.com');
  telefon = signal('099/8580-947');
  isEditing = signal(false);
  ciljevi: WritableSignal<string> = signal('Aktivno tražim poslodavca kod kojeg ću moći unaprijediti novostečene vještine.');

  @Output() imePrezimeChange = new EventEmitter<string>();
  @Output() titulaChange = new EventEmitter<string>();

  socialLinks = signal<SocialLink[]>([
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/josip-batini%C4%87-236112197/' },
    { platform: 'github', url: 'https://github.com/JosipBatinic' },
    { platform: 'whatsupp', url: 'https://web.whatsapp.com/' },
  ]);

  newSocialLink = { platform: '', url: '' };

  isAuthor = computed(() => this.authService.isAuthor());

  fields = computed<Field[]>(() => [
    { icon: 'osoba', value: this.imePrezime, type: 'text', placeholder: 'Ime i prezime' },
    { icon: 'zanimanje', value: this.titula, type: 'text', placeholder: 'Zanimanje' },
    { icon: 'email', value: this.email, type: 'email', placeholder: 'Email' },
    { icon: 'mobitel', value: this.telefon, type: 'tel', placeholder: 'Telefon' },
  ]);

  ngOnInit() {
    const data = this.dataService.getOsobniPodaciData();
    this.imePrezime.set(data.imePrezime);
    this.titula.set(data.titula);
    this.email.set(data.email);
    this.telefon.set(data.telefon);
    this.socialLinks.set(data.socialLinks);
  }

  updateField(field: Field, event: Event) {
    const input = event.target as HTMLInputElement;
    field.value.set(input.value);

    if (field.icon === 'person') {
      this.imePrezimeChange.emit(this.imePrezime());
      this.dataService.setOsobniPodaciData({
        imePrezime: this.imePrezime(),
        titula: this.titula(),
        email: this.email(),
        telefon: this.telefon(),
        socialLinks: this.socialLinks()
      });
    } else if (field.icon === 'work') {
      this.titulaChange.emit(this.titula());
      this.dataService.setOsobniPodaciData({
        imePrezime: this.imePrezime(),
        titula: this.titula(),
        email: this.email(),
        telefon: this.telefon(),
        socialLinks: this.socialLinks()
      });
    }
  }

  addSocialLink() {
    if (this.newSocialLink.platform && this.newSocialLink.url) {
      this.socialLinks.update(links => [...links, { ...this.newSocialLink }]);
      this.newSocialLink = { platform: '', url: '' };
      this.dataService.setOsobniPodaciData({
        imePrezime: this.imePrezime(),
        titula: this.titula(),
        email: this.email(),
        telefon: this.telefon(),
        socialLinks: this.socialLinks()
      });
    }
  }

  removeSocialLink(index: number) {
    this.socialLinks.update(links => links.filter((_, i) => i !== index));
    this.dataService.setOsobniPodaciData({
      imePrezime: this.imePrezime(),
      titula: this.titula(),
      email: this.email(),
      telefon: this.telefon(),
      socialLinks: this.socialLinks()
    });
  }

  getIconPath(platform: string): string {
    return `assets/${platform.toLowerCase()}-icon.png`;
  }

  toggleEdit() {
    this.isEditing.update(state => !state);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.slika.set(e.target.result as string);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  updateCiljevi(newCiljevi: string) {
    this.ciljevi.set(newCiljevi);
  }
}
