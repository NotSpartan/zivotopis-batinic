import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Motivation {
  id: number;
  text: string;
}

@Component({
  selector: 'app-ciljevi-motivacija',
  templateUrl: './ciljevi-motivacija.component.html',
  styleUrls: ['./ciljevi-motivacija.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CiljeviMotivacijaComponent {
  @Input() isGeneratingPDF = false;
  
  private dataService = inject(DataService);

  motivations = signal<Motivation[]>([]);
  currentIndex = signal(0);
  editingMotivation: Motivation | null = null;
  newMotivationText = '';
  maxLength = 120;
  showWarning = signal(false);

  ngOnInit() {
    const data = this.dataService.getCiljeviMotivacijaData();
    this.motivations.set(data.map((text, index) => ({ id: index + 1, text })));
  }

  nextMotivation() {
    if (this.isGeneratingPDF) return;
    this.currentIndex.update(index => (index + 1) % this.motivations().length);
  }

  previousMotivation() {
    if (this.isGeneratingPDF) return;
    this.currentIndex.update(index => (index - 1 + this.motivations().length) % this.motivations().length);
  }

  getPrevIndex(): number {
    return (this.currentIndex() - 1 + this.motivations().length) % this.motivations().length;
  }

  getNextIndex(): number {
    return (this.currentIndex() + 1) % this.motivations().length;
  }

  startEditing(motivation: Motivation) {
    if (this.isGeneratingPDF) return;
    this.editingMotivation = { ...motivation };
  }

  validateInput(text: string): boolean {
    if (text.length > this.maxLength) {
      this.showWarning.set(true);
      setTimeout(() => this.showWarning.set(false), 3000);
      return false;
    }
    return true;
  }

  addMotivation() {
    if (this.isGeneratingPDF) return;
    if (this.newMotivationText.trim() && this.validateInput(this.newMotivationText)) {
      const newId = Math.max(...this.motivations().map(m => m.id), 0) + 1;
      this.motivations.update(motivations => [...motivations, { id: newId, text: this.newMotivationText.trim() }]);
      this.newMotivationText = '';
      this.currentIndex.set(this.motivations().length - 1);
      this.updateDataService();
    }
  }

  saveEdit() {
    if (this.isGeneratingPDF) return;
    if (this.editingMotivation && this.validateInput(this.editingMotivation.text)) {
      this.motivations.update(motivations =>
        motivations.map(m => m.id === this.editingMotivation!.id ? this.editingMotivation! : m)
      );
      this.editingMotivation = null;
      this.updateDataService();
    }
  }

  cancelEdit() {
    if (this.isGeneratingPDF) return;
    this.editingMotivation = null;
  }

  removeMotivation(id: number) {
    if (this.isGeneratingPDF) return;
    this.motivations.update(motivations => motivations.filter(m => m.id !== id));
    if (this.currentIndex() >= this.motivations().length) {
      this.currentIndex.update(index => Math.max(0, index - 1));
    }
    this.updateDataService();
  }

  private updateDataService() {
    this.dataService.setCiljeviMotivacijaData(this.motivations().map(m => m.text));
  }
}
