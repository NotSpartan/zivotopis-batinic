import { Component, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  motivations = signal<Motivation[]>([
    { id: 1, text: 'Aktivno tražim poslodavca kod kojeg ću moći unaprijediti novostečene vještine.' },
    { id: 2, text: 'Želim raditi u dinamičnom okruženju koje potiče inovacije i kreativnost.' },
    { id: 3, text: 'Moj cilj je kontinuirano učenje i profesionalni razvoj u području softverskog razvoja.' }
  ]);

  currentIndex = signal(0);
  editingMotivation: Motivation | null = null;
  newMotivationText = '';

  nextMotivation() {
    this.currentIndex.update(index => (index + 1) % this.motivations().length);
  }

  previousMotivation() {
    this.currentIndex.update(index => (index - 1 + this.motivations().length) % this.motivations().length);
  }

  getPrevIndex(): number {
    return (this.currentIndex() - 1 + this.motivations().length) % this.motivations().length;
  }

  getNextIndex(): number {
    return (this.currentIndex() + 1) % this.motivations().length;
  }

  startEditing(motivation: Motivation) {
    this.editingMotivation = { ...motivation };
  }
  maxLength = 120;
  showWarning = signal(false);

  validateInput(text: string): boolean {
    if (text.length > this.maxLength) {
      this.showWarning.set(true);
      setTimeout(() => this.showWarning.set(false), 3000); // Sakrij upozorenje nakon 3 sekunde
      return false;
    }
    return true;
  }

  addMotivation() {
    if (this.newMotivationText.trim() && this.validateInput(this.newMotivationText)) {
      const newId = Math.max(...this.motivations().map(m => m.id), 0) + 1;
      this.motivations.update(motivations => [...motivations, { id: newId, text: this.newMotivationText.trim() }]);
      this.newMotivationText = '';
      this.currentIndex.set(this.motivations().length - 1);
    }
  }

  saveEdit() {
    if (this.editingMotivation && this.validateInput(this.editingMotivation.text)) {
      this.motivations.update(motivations =>
        motivations.map(m => m.id === this.editingMotivation!.id ? this.editingMotivation! : m)
      );
      this.editingMotivation = null;
    }
  }


  cancelEdit() {
    this.editingMotivation = null;
  }

  removeMotivation(id: number) {
    this.motivations.update(motivations => motivations.filter(m => m.id !== id));
    if (this.currentIndex() >= this.motivations().length) {
      this.currentIndex.update(index => Math.max(0, index - 1));
    }
  }


}
