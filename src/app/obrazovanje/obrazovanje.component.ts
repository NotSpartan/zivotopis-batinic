import { Component, Input, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Obrazovanje {
  id: number;
  year: string;
  title: string;
  institution: string;
  location: string;
  description?: string;
  institutionIcon?: string;
  bulletPoints: string[];
}

@Component({
  selector: 'app-obrazovanje',
  templateUrl: './obrazovanje.component.html',
  styleUrls: ['./obrazovanje.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ObrazovanjeComponent {
  @Input() isGeneratingPDF = false;
 
  private dataService = inject(DataService);

  educations = signal<Obrazovanje[]>([]);

  sortedEducations = computed(() =>
    this.educations().slice().sort((a, b) => parseInt(b.year) - parseInt(a.year))
  );

  newEducation: Obrazovanje = { id: 0, year: '', title: '', institution: '', location: '', bulletPoints: [] };
  editingEducation: Obrazovanje | null = null;
  newBulletPoint: string = '';

  ngOnInit() {
    const savedData = this.dataService.getEducationData();
    if (savedData.length > 0) {
      this.educations.set(savedData);
    } else {
      this.setDefaultEducations();
    }
  }

  setDefaultEducations() {
    const defaultEducations: Obrazovanje[] = [
      {
        id: 1,
        year: '2022',
        title: 'Magistar računarstva',
        institution: 'Fakultet elektrotehnike i računarstva',
        location: 'Zagreb, Hrvatska',
        description: 'Specijalizacija u području umjetne inteligencije i strojnog učenja.',
        institutionIcon: 'assets/fer-institution-icon.png',
        bulletPoints: [
          'Završni rad na temu "Primjena dubokog učenja u obradi prirodnog jezika"',
          'Sudjelovanje u istraživačkom projektu o računalnom vidu'
        ]
      },
      {
        id: 2,
        year: '2020',
        title: 'Prvostupnik računarstva',
        institution: 'Fakultet elektrotehnike i računarstva',
        location: 'Zagreb, Hrvatska',
        description: 'Fokus na programskom inženjerstvu i bazama podataka.',
        institutionIcon: 'assets/fer-institution-icon.png',
        bulletPoints: [
          'Osvojeno 2. mjesto na natjecanju iz programiranja',
          'Demonstrator na kolegiju Objektno orijentirano programiranje'
        ]
      }
    ];
    this.educations.set(defaultEducations);
  }

  addEducation() {
    if (this.isGeneratingPDF) return;
    if (this.newEducation.year && this.newEducation.title && this.newEducation.institution && this.newEducation.location) {
      const newId = Math.max(...this.educations().map(e => e.id), 0) + 1;
      this.educations.update(educations => {
        const updatedEducations = [...educations, { ...this.newEducation, id: newId, bulletPoints: [...this.newEducation.bulletPoints] }];
        this.dataService.setEducationData(updatedEducations);
        return updatedEducations;
      });
      this.newEducation = { id: 0, year: '', title: '', institution: '', location: '', bulletPoints: [] };
      this.newBulletPoint = '';
    }
  }

  removeEducation(id: number) {
    if (this.isGeneratingPDF) return;
    this.educations.update(educations => {
      const updatedEducations = educations.filter(e => e.id !== id);
      this.dataService.setEducationData(updatedEducations);
      return updatedEducations;
    });
  }

  startEditing(education: Obrazovanje) {
    if (this.isGeneratingPDF) return;
    this.editingEducation = { ...education, bulletPoints: [...education.bulletPoints] };
  }

  saveEdit() {
    if (this.isGeneratingPDF) return;
    if (this.editingEducation) {
      this.educations.update(educations => {
        const updatedEducations = educations.map(e =>
          e.id === this.editingEducation!.id ? this.editingEducation! : e
        );
        this.dataService.setEducationData(updatedEducations);
        return updatedEducations;
      });
      this.editingEducation = null;
    }
  }

  cancelEdit() {
    if (this.isGeneratingPDF) return;
    this.editingEducation = null;
  }

  addBulletPoint() {
    if (this.isGeneratingPDF) return;
    if (this.newBulletPoint.trim()) {
      if (this.editingEducation) {
        this.editingEducation.bulletPoints.push(this.newBulletPoint.trim());
      } else {
        this.newEducation.bulletPoints.push(this.newBulletPoint.trim());
      }
      this.newBulletPoint = '';
    }
  }

  removeBulletPoint(index: number) {
    if (this.isGeneratingPDF) return;
    if (this.editingEducation) {
      this.editingEducation.bulletPoints.splice(index, 1);
    } else {
      this.newEducation.bulletPoints.splice(index, 1);
    }
  }

  onFileSelected(event: Event, education: Obrazovanje) {
    if (this.isGeneratingPDF) return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          education.institutionIcon = e.target.result as string;
          this.educations.update(educations => {
            const updatedEducations = [...educations];
            this.dataService.setEducationData(updatedEducations);
            return updatedEducations;
          });
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  formatYearToHrv(year: string): string {
    return `${year}.`;
  }
}
