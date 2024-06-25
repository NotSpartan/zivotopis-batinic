import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ProfileHeaderComponent implements OnInit, OnDestroy {
  @Input() slika: string = '';
  @Input() imePrezime: WritableSignal<string> = signal('');
  @Input() titula: WritableSignal<string> = signal('');
  @Input() isAuthor: boolean = false;
  @Input() ciljevi!: WritableSignal<string>;
  @Output() fileSelected = new EventEmitter<Event>();

  isEditing: WritableSignal<boolean> = signal(false);
  displayedTitle: WritableSignal<string> = signal('');
  private animationInterval: any;

  private dataService = inject(DataService);

  ngOnInit() {
    const data = this.dataService.getOsobniPodaciData();
    this.imePrezime.set(data.imePrezime);
    this.titula.set(data.titula);
    this.startTitleAnimation();
  }

  ngOnDestroy() {
    this.stopTitleAnimation();
  }

  @Output() slikaChange = new EventEmitter<string>();

  onFileSelected(event: Event) {
    const input = (event.target as HTMLInputElement)?.files?.[0];
    if (input) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.slika = e.target.result as string;
          this.slikaChange.emit(this.slika);
        }
      };
      reader.readAsDataURL(input);
    }
  }

  deleteImage() {
    this.slika = ''; // Postavi sliku na praznu vrijednost
    this.slikaChange.emit(''); // Emitirati praznu vrijednost za sliku
  }

  private startTitleAnimation() {
    let index = 0;
    this.animationInterval = setInterval(() => {
      this.displayedTitle.set(this.titula().substring(0, index + 1));
      index = (index + 1) % (this.titula().length + 1);
      if (index === 0) {
        setTimeout(() => {
          this.displayedTitle.set('');
        }, 1000);
      }
    }, 200);
  }

  private stopTitleAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }
}
