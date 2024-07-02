import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, WritableSignal, ViewChild, ElementRef } from '@angular/core';
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
  @Input() isGeneratingPDF: boolean = false;
  @Input() isGeneratingWord: boolean = false;
  @Output() fileSelected = new EventEmitter<Event>();
  @Output() slikaChange = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isEditing: WritableSignal<boolean> = signal(false);
  displayedTitle: WritableSignal<string> = signal('');
  private animationInterval: any;

  private dataService = inject(DataService);

  ngOnInit() {
    const data = this.dataService.getOsobniPodaciData();
    this.imePrezime.set(data.imePrezime);
    this.titula.set(data.titula);
    this.slika = data.slika || '';
    if (!this.isGeneratingPDF && !this.isGeneratingWord) {
      this.startTitleAnimation();
    }
  }

  ngOnDestroy() {
    this.stopTitleAnimation();
  }

  updateImePrezime(newImePrezime: string) {
    if (!this.isGeneratingPDF && !this.isGeneratingWord) {
      this.imePrezime.set(newImePrezime);
      this.updateDataService();
    }
  }

  updateTitula(newTitula: string) {
    if (!this.isGeneratingPDF && !this.isGeneratingWord) {
      this.titula.set(newTitula);
      this.updateDataService();
    }
  }

  onFileSelected(event: Event) {
    if (!this.isGeneratingPDF && !this.isGeneratingWord) {
      const input = (event.target as HTMLInputElement)?.files?.[0];
      if (input) {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.slika = e.target.result as string;
            this.slikaChange.emit(this.slika);
            this.updateDataService();
            this.resetFileInput();
          }
        };
        reader.readAsDataURL(input);
      }
    }
  }

  deleteImage() {
    if (!this.isGeneratingPDF && !this.isGeneratingWord) {
      this.slika = '';
      this.slikaChange.emit('');
      this.updateDataService();
      this.resetFileInput();
    }
  }

  private resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private updateDataService() {
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      imePrezime: this.imePrezime(),
      titula: this.titula(),
      slika: this.slika,
    });
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
