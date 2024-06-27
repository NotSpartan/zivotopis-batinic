import { Component, signal, computed } from '@angular/core';
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
  constructor(private dataService: DataService) {}

  ngOnInit() {
    const savedData = this.dataService.getEducationData();
    if (savedData.length > 0) {
      this.educations.set(savedData);
    }
  }

  educations = signal<Obrazovanje[]>([
    { id: 1, year: '2019', title: 'Salesforce Administrator', institution: 'Simplilearn', location: 'Raleigh', description: 'Completed initial level for Salesforce administrator on Simplilearn platform.' },
    { id: 2, year: '2019', title: 'Computer Programmer for Internet Applications', institution: 'Algebra', location: 'Zagreb' },
    { id: 3, year: '2016', title: 'Senior Expert Associate', institution: 'Ministry of Public Administration', location: 'Zagreb', description: 'Passed state professional exam for senior expert associate.' },
    { id: 4, year: '2012', title: 'Master of Education in History', institution: 'Croatian Studies', location: 'Zagreb', description: 'Completed teaching track of graduate study in history. Defended thesis "Brotherhood of the Croatian Dragon".' },
    { id: 5, year: '2009', title: 'Bachelor of Communication Science', institution: 'Croatian Studies', location: 'Zagreb', description: 'Completed undergraduate study in communication science, agency-press track.' }
  ]);

  sortedEducations = computed(() => 
    this.educations().slice().sort((a, b) => parseInt(b.year) - parseInt(a.year))
  );

  newEducation: Obrazovanje = { id: 0, year: '', title: '', institution: '', location: '' };
  editingEducation: Obrazovanje | null = null;

  addEducation() {
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
    this.educations.update(educations => {
      const updatedEducations = educations.filter(e => e.id !== id);
      this.dataService.setEducationData(updatedEducations);
      return updatedEducations;
    });
  }

  startEditing(education: Obrazovanje) {
    this.editingEducation = { ...education };
  }

  saveEdit() {
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
    this.editingEducation = null;
  }

  onFileSelected(event: Event, education: Obrazovanje) {
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