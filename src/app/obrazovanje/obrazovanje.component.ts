import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Obrazovanje {
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
    { year: '2019', title: 'Salesforce Administrator', institution: 'Simplilearn', location: 'Raleigh', description: 'Completed initial level for Salesforce administrator on Simplilearn platform.' },
    { year: '2019', title: 'Computer Programmer for Internet Applications', institution: 'Algebra', location: 'Zagreb' },
    { year: '2016', title: 'Senior Expert Associate', institution: 'Ministry of Public Administration', location: 'Zagreb', description: 'Passed state professional exam for senior expert associate.' },
    { year: '2012', title: 'Master of Education in History', institution: 'Croatian Studies', location: 'Zagreb', description: 'Completed teaching track of graduate study in history. Defended thesis "Brotherhood of the Croatian Dragon".' },
    { year: '2009', title: 'Bachelor of Communication Science', institution: 'Croatian Studies', location: 'Zagreb', description: 'Completed undergraduate study in communication science, agency-press track.' }
  ]);

  newEducation: Obrazovanje = { year: '', title: '', institution: '', location: '' };

  addEducation() {
    this.educations.update(educations => {
      const updatedEducations = [...educations, { ...this.newEducation }];
      this.dataService.setEducationData(updatedEducations);
      return updatedEducations;
    });
    this.newEducation = { year: '', title: '', institution: '', location: '' };
  }

  removeEducation(index: number) {
    this.educations.update(educations => {
      const updatedEducations = educations.filter((_, i) => i !== index);
      this.dataService.setEducationData(updatedEducations);
      return updatedEducations;
    });
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
