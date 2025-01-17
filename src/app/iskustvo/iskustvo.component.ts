import { Component, Input, Output, signal, computed, inject, OnInit } from '@angular/core';
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
export class IskustvoComponent implements OnInit {
  @Input() isGeneratingPDF = false;
  @Input() isGeneratingWord = false;

  private dataService = inject(DataService);

  experiences = signal<Iskustvo[]>([]);

  sortedExperiences = computed(() =>
    this.experiences().slice().sort((a, b) => {
      const dateA = new Date(a.startDate.split('.').reverse().join('-'));
      const dateB = new Date(b.startDate.split('.').reverse().join('-'));
      return dateB.getTime() - dateA.getTime();
    })
  );

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

  ngOnInit() {
    const savedData = this.dataService.getExperienceData();
    if (savedData.length > 0) {
      this.experiences.set(savedData);
    } else {
      this.setDefaultExperiences();
    }
  }

  setDefaultExperiences() {
    const defaultExperiences: Iskustvo[] = [
      {
        id: 1,
        startDate: '01.2022',
        endDate: 'Trenutno',
        position: 'Senior Software Developer',
        company: 'Tech Inovacije d.o.o.',
        location: 'Zagreb, Hrvatska',
        responsibilities: [
          'Razvoj i održavanje web aplikacija koristeći Angular i Node.js',
          'Implementacija CI/CD procesa',
          'Mentoriranje junior developera'
        ],
        companyIcon: 'assets/default-company-icon2.png'
      },
      {
        id: 2,
        startDate: '06.2019',
        endDate: '12.2021',
        position: 'Full Stack Developer',
        company: 'Web Solutions d.o.o.',
        location: 'Split, Hrvatska',
        responsibilities: [
          'Razvoj responzivnih web stranica',
          'Integracija s različitim API-jima',
          'Optimizacija performansi postojećih aplikacija'
        ],
        companyIcon: 'assets/default-company-icon.png'
      }
    ];
    this.experiences.set(defaultExperiences);
  }

  addExperience() {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
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
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    this.experiences.update(experiences => {
      const updatedExperiences = experiences.filter(e => e.id !== id);
      this.dataService.setExperienceData(updatedExperiences);
      return updatedExperiences;
    });
  }

  startEditing(experience: Iskustvo) {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    this.editingExperience = { ...experience, responsibilities: [...experience.responsibilities] };
  }

  saveEdit() {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
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
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    this.editingExperience = null;
  }

  addResponsibility() {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
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
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
    if (this.editingExperience) {
      this.editingExperience.responsibilities.splice(index, 1);
    } else {
      this.newExperience.responsibilities.splice(index, 1);
    }
  }

  onFileSelected(event: Event, experience: Iskustvo) {
    if (this.isGeneratingPDF || this.isGeneratingWord) return;
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
