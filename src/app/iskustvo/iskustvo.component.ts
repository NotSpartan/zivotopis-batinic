import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Iskustvo {
  startDate: string;
  endDate: string;
  position: string;
  company: string;
  location: string;
  responsibilities: string[];
  companyIcon?: string;
}

@Component({
  selector: 'app-iskustvo',
  templateUrl: './iskustvo.component.html',
  styleUrls: ['./iskustvo.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class IskustvoComponent {
  constructor(private dataService: DataService) {}

  ngOnInit() {
    const savedData = this.dataService.getExperienceData();
    if (savedData.length > 0) {
      this.experiences.set(savedData);
    }
  }
  experiences = signal<Iskustvo[]>([
    {
      startDate: 'December 2017',
      endDate: 'February 2019',
      position: 'Krupije',
      company: 'Hrvatska lutrija',
      location: 'Zagreb',
      responsibilities: [
        'Vođenje žive igre na French Roullet, Blackjack i Carribien poker stolovima.',
        'Primjenjivanje propisanih pravila i protokola prilikom isplate dobitaka igračima.',
        'Organizacija free-roll poker turnira.',
        'Vođenje evidencije o dnevnom utršku aktivnih stolova.'
      ]
    },
    {
      startDate: 'January 2016',
      endDate: 'January 2017',
      position: 'Viši stručni suradnik za protokol',
      company: 'Zagrebačka županija',
      location: 'Zagreb',
      responsibilities: [
        'Pisanje i objavljivanje vijesti, najava, priopćenja i poziva za medije za službenu web stranicu Zagrebačke županije.',
        'Administracija službene CMS, WordPress i Facebook stranice Zagrebačke županije.',
        'Praćenje posjete gostiju službenih stranica korištenjem Google Analytics alata.',
        'Pisanje govora i organizacija protokola župana Zagrebačke županije.'
      ]
    },
    {
      startDate: 'May 2014',
      endDate: 'April 2015',
      position: 'Zamjenik poslovođe',
      company: 'OREMAR d.o.o.',
      location: 'Zagreb',
      responsibilities: [
        'Prijem i prodaja robe širokog asortimana, te naftnih derivata.',
        'Rad s kupcima i trgovačkim agentima.',
        'Održavanje službenih prostorija.'
      ]
    }
  ]);

  newExperience: Iskustvo = {
    startDate: '',
    endDate: '',
    position: '',
    company: '',
    location: '',
    responsibilities: [],
    companyIcon: ''
  };
  newResponsibility: string = '';

  addExperience() {
    this.experiences.update(experiences => {
      const updatedExperiences = [...experiences, { ...this.newExperience, responsibilities: [...this.newExperience.responsibilities] }];
      this.dataService.setExperienceData(updatedExperiences);
      return updatedExperiences;
    });
    this.newExperience = { startDate: '', endDate: '', position: '', company: '', location: '', responsibilities: [], companyIcon: '' };
  }

  removeExperience(index: number) {
    this.experiences.update(experiences => {
      const updatedExperiences = experiences.filter((_, i) => i !== index);
      this.dataService.setExperienceData(updatedExperiences);
      return updatedExperiences;
    });
  }

  addResponsibility() {
    if (this.newResponsibility.trim()) {
      this.newExperience.responsibilities.push(this.newResponsibility.trim());
      this.newResponsibility = '';
    }
  }

  removeResponsibility(index: number) {
    this.newExperience.responsibilities.splice(index, 1);
  }

  onFileSelected(event: Event, experience: Iskustvo) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          experience.companyIcon = e.target.result as string;
          this.experiences.update(experiences => {
            const updatedExperiences = [...experiences];
            this.dataService.setExperienceData(updatedExperiences);
            return updatedExperiences;
          });
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}