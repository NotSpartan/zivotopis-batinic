import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
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
  @Input() isAuthor: boolean = false;
  @Input() ciljevi!: WritableSignal<string>;
  @Output() fileSelected = new EventEmitter<Event>();

  isEditing: WritableSignal<boolean> = signal(false);
  displayedTitle: WritableSignal<string> = signal('');
  private animationInterval: any;

  ngOnInit() {
    this.startTitleAnimation();
  }

  ngOnDestroy() {
    this.stopTitleAnimation();
  }
  @Output() slikaChange = new EventEmitter<string>();

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.slika = e.target.result as string;
          this.slikaChange.emit(this.slika);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
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
