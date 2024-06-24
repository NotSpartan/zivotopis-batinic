import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';

interface Motivation {
  id: number;
  text: string;
}

@Component({
  selector: 'app-ciljevi-motivacija',
  templateUrl: './ciljevi-motivacija.component.html',
  styleUrls: ['./ciljevi-motivacija.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(-50px)' }))
      ])
    ])
  ]
})
export class CiljeviMotivacijaComponent {
  motivations = signal<Motivation[]>([
    { id: 1, text: 'Aktivno tražim poslodavca kod kojeg ću moći unaprijediti novostečene vještine.' },
    { id: 2, text: 'Želim raditi u dinamičnom okruženju koje potiče inovacije i kreativnost.' },
    { id: 3, text: 'Moj cilj je kontinuirano učenje i profesionalni razvoj u području softverskog razvoja.' }
  ]);

  currentIndex = signal(0);
  newMotivationText = '';
  editingMotivation: Motivation | null = null;

  nextMotivation() {
    this.currentIndex.update(index => (index + 1) % this.motivations().length);
  }

  previousMotivation() {
    this.currentIndex.update(index => (index - 1 + this.motivations().length) % this.motivations().length);
  }

  addMotivation() {
    if (this.newMotivationText.trim()) {
      const newId = Math.max(...this.motivations().map(m => m.id), 0) + 1;
      this.motivations.update(motivations => [...motivations, { id: newId, text: this.newMotivationText.trim() }]);
      this.newMotivationText = '';
      this.currentIndex.set(this.motivations().length - 1);
    }
  }

  removeCurrentMotivation() {
    const currentId = this.motivations()[this.currentIndex()].id;
    this.motivations.update(motivations => motivations.filter(m => m.id !== currentId));
    if (this.currentIndex() >= this.motivations().length) {
      this.currentIndex.update(index => Math.max(0, index - 1));
    }
  }

  startEditing() {
    this.editingMotivation = { ...this.motivations()[this.currentIndex()] };
  }

  saveEdit() {
    if (this.editingMotivation) {
      this.motivations.update(motivations => 
        motivations.map(m => m.id === this.editingMotivation!.id ? this.editingMotivation! : m)
      );
      this.editingMotivation = null;
    }
  }

  cancelEdit() {
    this.editingMotivation = null;
  }
}
