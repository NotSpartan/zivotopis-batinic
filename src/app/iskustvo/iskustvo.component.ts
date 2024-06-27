import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Iskustvo {
  id: number;
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
      id: 1,
      startDate: '12.2017',
      endDate: '02.2019',
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
      id: 2,
      startDate: '01.2016',
      endDate: '01.2017',
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
      id: 3,
      startDate: '05.2014',
      endDate: '04.2015',
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
    id: 0,
    startDate: '',
    endDate: '',
    position: '',
    company: '',
    location: '',
    responsibilities: [],
    companyIcon: ''
  };
  newResponsibility: string = '';
  editingExperience: Iskustvo | null = null;

  addExperience() {
    if (this.newExperience.startDate && this.newExperience.position && this.newExperience.company && this.newExperience.location) {
      const newId = Math.max(...this.experiences().map(e => e.id), 0) + 1;
      this.experiences.update(experiences => {
        const updatedExperiences = [...experiences, { ...this.newExperience, id: newId, responsibilities: [...this.newExperience.responsibilities] }];
        this.dataService.setExperienceData(updatedExperiences);
        return updatedExperiences;
      });
      this.newExperience = { id: 0, startDate: '', endDate: '', position: '', company: '', location: '', responsibilities: [], companyIcon: '' };
      this.newResponsibility = '';
    }
  }

  removeExperience(id: number) {
    this.experiences.update(experiences => {
      const updatedExperiences = experiences.filter(e => e.id !== id);
      this.dataService.setExperienceData(updatedExperiences);
      return updatedExperiences;
    });
  }

  startEditing(experience: Iskustvo) {
    this.editingExperience = { ...experience, responsibilities: [...experience.responsibilities] };
  }

  saveEdit() {
    if (this.editingExperience) {
      this.experiences.update(experiences => {
        const updatedExperiences = experiences.map(e => 
          e.id === this.editingExperience!.id ? this.editingExperience! : e
        );
        this.dataService.setExperienceData(updatedExperiences);
        return updatedExperiences;
      });
      this.editingExperience = null;
    }
  }

  cancelEdit() {
    this.editingExperience = null;
  }

  addResponsibility() {
    if (this.newResponsibility.trim()) {
      if (this.editingExperience) {
        this.editingExperience.responsibilities.push(this.newResponsibility.trim());
      } else {
        this.newExperience.responsibilities.push(this.newResponsibility.trim());
      }
      this.newResponsibility = '';
    }
  }

  removeResponsibility(index: number) {
    if (this.editingExperience) {
      this.editingExperience.responsibilities.splice(index, 1);
    } else {
      this.newExperience.responsibilities.splice(index, 1);
    }
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

  formatDateToHrv(dateString: string): string {
    const [month, year] = dateString.split('.');
    const monthNames = [
      'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
      'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
    ];
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}.`;
  }
}
