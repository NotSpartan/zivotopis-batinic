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
    trigger('cardSlide', [
      state('current', style({ transform: 'translateX(0)' })),
      state('next', style({ transform: 'translateX(-100%)' })),
      state('prev', style({ transform: 'translateX(100%)' })),
      transition('current => next', animate('500ms ease-out')),
      transition('current => prev', animate('500ms ease-out')),
      transition('next => current, prev => current', animate('500ms ease-out'))
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
  slideState = signal('current');
  editingMotivation: Motivation | null = null;
  newMotivationText = '';

  nextMotivation() {
    this.slideState.set('next');
    setTimeout(() => {
      this.currentIndex.update(index => (index + 1) % this.motivations().length);
      this.slideState.set('current');
    }, 500);
  }

  previousMotivation() {
    this.slideState.set('prev');
    setTimeout(() => {
      this.currentIndex.update(index => (index - 1 + this.motivations().length) % this.motivations().length);
      this.slideState.set('current');
    }, 500);
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

  removeCurrentMotivation() {
    const currentId = this.motivations()[this.currentIndex()].id;
    this.motivations.update(motivations => motivations.filter(m => m.id !== currentId));
    if (this.currentIndex() >= this.motivations().length) {
      this.currentIndex.update(index => Math.max(0, index - 1));
    }
  }

  addMotivation() {
    if (this.newMotivationText.trim()) {
      const newId = Math.max(...this.motivations().map(m => m.id), 0) + 1;
      this.motivations.update(motivations => [...motivations, { id: newId, text: this.newMotivationText.trim() }]);
      this.newMotivationText = '';
      this.currentIndex.set(this.motivations().length - 1);
    }
  }
}
