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

  newEducation: Obrazovanje = { id: 0, year: '', title: '', institution: '', location: '' };
  editingEducation: Obrazovanje | null = null;

  ngOnInit() {
    const savedData = this.dataService.getEducationData();
    if (savedData.length > 0) {
      this.educations.set(savedData);
    }
  }

  addEducation() {
    if (this.isGeneratingPDF) return;
    if (this.newEducation.year && this.newEducation.title && this.newEducation.institution && this.newEducation.location) {
      const newId = Math.max(...this.educations().map(e => e.id), 0) + 1;
      this.educations.update(educations => {
        const updatedEducations = [...educations, { ...this.newEducation, id: newId }];
        this.dataService.setEducationData(updatedEducations);
        return updatedEducations;
      });
      this.newEducation = { id: 0, year: '', title: '', institution: '', location: '' };
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
    this.editingEducation = { ...education };
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
