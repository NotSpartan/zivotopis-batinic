import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Tehnologija {
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
  constructor(private dataService: DataService) {}

  ngOnInit() {
    const savedData = this.dataService.getTechnologiesData();
    if (savedData.length > 0) {
      this.tehnologije.set(savedData);
    }
  }

  tehnologije = signal<Tehnologija[]>([
    { naziv: 'JavaScript', razina: 'Napredna' },
    { naziv: 'TypeScript', razina: 'Srednja' },
    { naziv: 'Angular', razina: 'Napredna' },
    { naziv: 'React', razina: 'Osnovna' },
    { naziv: 'Node.js', razina: 'Srednja' }
  ]);

  novaTehnoloija: Tehnologija = {
    naziv: '',
    razina: '',
  };

  dodajTehnologiju() {
    if (this.novaTehnoloija.naziv && this.novaTehnoloija.razina) {
      this.tehnologije.update((tehnologije) => {
        const updatedTehnologije = [...tehnologije, { ...this.novaTehnoloija }];
        this.dataService.setTechnologiesData(updatedTehnologije);
        return updatedTehnologije;
      });
      this.novaTehnoloija = { naziv: '', razina: '' };
    }
  }

  ukloniTehnologiju(index: number) {
    this.tehnologije.update((tehnologije) => {
      const updatedTehnologije = tehnologije.filter((_, i) => i !== index);
      this.dataService.setTechnologiesData(updatedTehnologije);
      return updatedTehnologije;
    });
  }

  odaberiIkonu(event: Event, tehnologija: Tehnologija) {
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
