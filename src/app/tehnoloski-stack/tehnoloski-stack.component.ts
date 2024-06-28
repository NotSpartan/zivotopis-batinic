import { Component, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Tehnologija {
  id: number;
  naziv: string;
  razina: string;
  ikona?: string;
}

@Component({
  selector: 'app-tehnoloski-stack',
  templateUrl: './tehnoloski-stack.component.html',
  styleUrls: ['./tehnoloski-stack.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TehnoloskiStackComponent {
  @Input() isGeneratingPDF = false;
 
  private dataService = inject(DataService);

  tehnologije = signal<Tehnologija[]>([]);

  novaTehnoloija: Tehnologija = {
    id: 0,
    naziv: '',
    razina: '',
  };

  editingTehnologija: Tehnologija | null = null;

  ngOnInit() {
    const savedData = this.dataService.getTechnologiesData();
    if (savedData.length > 0) {
      this.tehnologije.set(savedData);
    } else {
      this.setDefaultTehnologije();
    }
  }

  setDefaultTehnologije() {
    const defaultTehnologije: Tehnologija[] = [
      { id: 1, naziv: 'JavaScript', razina: 'Napredno', ikona: 'assets/javascript-icon.png' },
      { id: 2, naziv: 'TypeScript', razina: 'Srednje', ikona: 'assets/typescript-icon.png' },
      { id: 3, naziv: 'Angular', razina: 'Napredno', ikona: 'assets/angular-icon.png' },
      { id: 4, naziv: 'React', razina: 'Osnovno', ikona: 'assets/react-icon.png' },
      { id: 5, naziv: 'Node.js', razina: 'Srednje', ikona: 'assets/nodejs-icon.png' },
      { id: 6, naziv: 'SQL', razina: 'Napredno', ikona: 'assets/sql-icon.png' },
    ];
    this.tehnologije.set(defaultTehnologije);
    this.dataService.setTechnologiesData(defaultTehnologije);
  }

  dodajTehnologiju() {
    if (this.isGeneratingPDF) return;
    if (this.novaTehnoloija.naziv && this.novaTehnoloija.razina) {
      const newId = Math.max(...this.tehnologije().map(t => t.id), 0) + 1;
      this.tehnologije.update((tehnologije) => {
        const updatedTehnologije = [...tehnologije, { ...this.novaTehnoloija, id: newId }];
        this.dataService.setTechnologiesData(updatedTehnologije);
        return updatedTehnologije;
      });
      this.novaTehnoloija = { id: 0, naziv: '', razina: '' };
    }
  }

  ukloniTehnologiju(id: number) {
    if (this.isGeneratingPDF) return;
    this.tehnologije.update((tehnologije) => {
      const updatedTehnologije = tehnologije.filter(t => t.id !== id);
      this.dataService.setTechnologiesData(updatedTehnologije);
      return updatedTehnologije;
    });
  }

  startEditing(tehnologija: Tehnologija) {
    if (this.isGeneratingPDF) return;
    this.editingTehnologija = { ...tehnologija };
  }

  saveEdit() {
    if (this.isGeneratingPDF) return;
    if (this.editingTehnologija) {
      this.tehnologije.update((tehnologije) => {
        const updatedTehnologije = tehnologije.map(t =>
          t.id === this.editingTehnologija!.id ? this.editingTehnologija! : t
        );
        this.dataService.setTechnologiesData(updatedTehnologije);
        return updatedTehnologije;
      });
      this.editingTehnologija = null;
    }
  }

  cancelEdit() {
    if (this.isGeneratingPDF) return;
    this.editingTehnologija = null;
  }

  odaberiIkonu(event: Event, tehnologija: Tehnologija) {
    if (this.isGeneratingPDF) return;
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          tehnologija.ikona = e.target.result as string;
          this.tehnologije.update((tehnologije) => {
            const updatedTehnologije = [...tehnologije];
            this.dataService.setTechnologiesData(updatedTehnologije);
            return updatedTehnologije;
          });
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
