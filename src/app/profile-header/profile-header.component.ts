import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProfileHeaderComponent implements OnInit, OnDestroy {
  @Input() slika: string = '';
  @Input() imePrezime: string = '';
  @Input() titula: string = '';
  @Input() isEditing: boolean = false;
  @Input() isAuthor: boolean = false;

  @Output() fileSelected = new EventEmitter<Event>();
  @Output() editToggled = new EventEmitter<void>();

  displayedTitle: string = '';
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
    this.editToggled.emit();
  }

  private startTitleAnimation() {
    let index = 0;
    this.animationInterval = setInterval(() => {
      this.displayedTitle = this.titula.substring(0, index + 1);
      index = (index + 1) % (this.titula.length + 1);
      if (index === 0) {
        // Dodajemo malu pauzu kada se tekst u potpunosti ispiše
        setTimeout(() => {
          this.displayedTitle = '';
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
