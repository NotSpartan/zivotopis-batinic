import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CiljeviMotivacijaComponent } from '../ciljevi-motivacija/ciljevi-motivacija.component';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css'],
  standalone: true,
  imports: [CommonModule, CiljeviMotivacijaComponent],
})
export class ProfileHeaderComponent implements OnInit, OnDestroy {
  @Input() slika: string = '';
  @Input() imePrezime: string = '';
  @Input() titula: string = '';
  @Input() isAuthor: boolean = false;
  @Input() ciljevi!: WritableSignal<string>;

  @Output() fileSelected = new EventEmitter<Event>();
  @Output() editToggled = new EventEmitter<void>();
  @Output() ciljeviChanged = new EventEmitter<string>();

  isEditing: WritableSignal<boolean> = signal(false);
  displayedTitle: WritableSignal<string> = signal('');
  private animationInterval: any;

  ngOnInit() {
    this.startTitleAnimation();
  }

  ngOnDestroy() {
    this.stopTitleAnimation();
  }

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  toggleEdit() {
    this.isEditing.update(state => !state);
    this.editToggled.emit();
  }

  updateCiljevi(newCiljevi: string) {
    this.ciljevi.set(newCiljevi);
    this.ciljeviChanged.emit(newCiljevi);
  }

  private startTitleAnimation() {
    let index = 0;
    this.animationInterval = setInterval(() => {
      this.displayedTitle.set(this.titula.substring(0, index + 1));
      index = (index + 1) % (this.titula.length + 1);
      if (index === 0) {
        // Dodajemo malu pauzu kada se tekst u potpunosti ispiše
        setTimeout(() => {
          this.displayedTitle.set('');
        }, 1000);
      }
    }, 200); // Prilagodite ovu vrijednost za bržu ili sporiju animaciju
  }

  private stopTitleAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }
}
