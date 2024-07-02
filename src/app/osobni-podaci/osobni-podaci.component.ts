import { Component, Input, Output, signal, computed, inject, WritableSignal, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

interface Field {
  icon: string;
  value: WritableSignal<string>;
  type: 'text' | 'email' | 'tel';
  placeholder: string;
  name: string;
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
export class OsobniPodaciComponent implements OnInit {
  @Input() isGeneratingPDF = false;
  @Input() isGeneratingWord = false;

  @Output() imePrezimeChange = new EventEmitter<string>();
  @Output() titulaChange = new EventEmitter<string>();

  private authService = inject(AuthService);
  private dataService = inject(DataService);

  slika = signal('assets/default-profile.png');
  imePrezime = signal('');
  titula = signal('');
  email = signal('');
  telefon = signal('');
  isEditing = signal(false);
  ciljevi: WritableSignal<string> = signal('');
  socialLinks = signal<SocialLink[]>([]);

  newSocialLink = { platform: '', url: '' };

  isAuthor = computed(() => this.authService.isAuthor());

  fields = computed<Field[]>(() => [
    { name: 'imePrezime', icon: 'Osoba:', value: this.imePrezime, type: 'text', placeholder: 'Ime i prezime' },
    { name: 'titula', icon: 'Pozicija:', value: this.titula, type: 'text', placeholder: 'Zanimanje' },
    { name: 'telefon', icon: 'Telefon:', value: this.telefon, type: 'tel', placeholder: 'Telefon' },
    { name: 'email', icon: 'E-pošta:', value: this.email, type: 'email', placeholder: 'Email' },
  ]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const data = this.dataService.getOsobniPodaciData();
    this.imePrezime.set(data.imePrezime || this.getDefaultValue('imePrezime'));
    this.titula.set(data.titula || this.getDefaultValue('titula'));
    this.telefon.set(data.telefon || this.getDefaultValue('telefon'));
    this.email.set(data.email || this.getDefaultValue('email'));
    this.socialLinks.set(data.socialLinks?.length > 0 ? data.socialLinks : this.getDefaultSocialLinks());
    this.ciljevi.set(data.ciljevi || this.getDefaultValue('ciljevi'));
  }

  updateField(field: Field, event: Event) {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    
    const input = event.target as HTMLInputElement;
    field.value.set(input.value);

    if (field.name === 'imePrezime') {
      this.imePrezimeChange.emit(this.imePrezime());
    } else if (field.name === 'titula') {
      this.titulaChange.emit(this.titula());
    }
    this.updateDataService();
  }

  addSocialLink() {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    
    if (this.newSocialLink.platform && this.newSocialLink.url) {
      this.socialLinks.update(links => [...links, { ...this.newSocialLink }]);
      this.newSocialLink = { platform: '', url: '' };
      this.updateDataService();
    }
  }

  removeSocialLink(index: number) {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    
    this.socialLinks.update(links => links.filter((_, i) => i !== index));
    this.updateDataService();
  }

  getIconPath(platform: string): string {
    return `assets/${platform.toLowerCase()}-icon.png`;
  }

  toggleEdit() {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    
    this.isEditing.update(state => !state);
  }

  updateCiljevi(newCiljevi: string) {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    
    this.ciljevi.set(newCiljevi);
    this.updateDataService();
  }

  private updateDataService() {
    this.dataService.setOsobniPodaciData({
      imePrezime: this.imePrezime(),
      titula: this.titula(),
      telefon: this.telefon(),
      email: this.email(),
      socialLinks: this.socialLinks(),
      ciljevi: this.ciljevi()
    });
  }

  private getDefaultValue(fieldName: string): string {
    const defaults: { [key: string]: string } = {
      imePrezime: 'Ana Horvat',
      titula: 'Software Developer',
      telefon: '+385 91 234 5678',
      email: 'ana.horvat@example.com',
      ciljevi: 'Aktivno tražim poslodavca kod kojeg ću moći unaprijediti novostečene vještine.'
    };
    return defaults[fieldName] || '';
  }

  private getDefaultSocialLinks(): SocialLink[] {
    return [
      { platform: 'linkedin', url: 'https://www.linkedin.com/in/ana-horvat' },
      { platform: 'github', url: 'https://github.com/anahorvat' },
      { platform: 'whatsapp', url: 'https://web.whatsapp.com/' },
      { platform: 'gmail', url: 'https://www.gmail.com/' },
    ];
  }
}
