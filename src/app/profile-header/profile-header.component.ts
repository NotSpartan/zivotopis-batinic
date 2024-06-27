import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';

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

  removeImage() {
    this.slika = 'assets/default-profile.png';
    this.slikaChange.emit('assets/default-profile.png');
  }

  updateImePrezime(newImePrezime: string) {
    this.imePrezime.set(newImePrezime);
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      imePrezime: this.imePrezime(),
    });
  }

  updateTitula(newTitula: string) {
    this.titula.set(newTitula);
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      titula: this.titula(),
    });
  }

  onFileSelected(event: Event) {
    const input = (event.target as HTMLInputElement)?.files?.[0];
    if (input) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.slika = e.target.result as string;
          this.slikaChange.emit(this.slika);
          this.dataService.setOsobniPodaciData({
            ...this.dataService.getOsobniPodaciData(),
            slika: this.slika,
          });
        }
      };
      reader.readAsDataURL(input);
    }
  }

  deleteImage() {
    this.slika = '';
    this.slikaChange.emit('');
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      slika: '',
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

  async generatePDF() {
    const pdf = new jsPDF();
    let yOffset = 10;

    // Dodaj osobne podatke
    const osobniPodaci = this.dataService.getOsobniPodaciData();
    pdf.setFontSize(16);
    pdf.text(osobniPodaci.imePrezime, 10, yOffset);
    yOffset += 10;
    pdf.setFontSize(12);
    pdf.text(osobniPodaci.titula, 10, yOffset);
    yOffset += 10;

    // Dodaj sliku profila ako postoji
    if (osobniPodaci.slika) {
      const img = await this.loadImage(osobniPodaci.slika);
      pdf.addImage(img, 'JPEG', 10, yOffset, 40, 40);
      yOffset += 50;
    }

    // Dodaj ostale sekcije
    yOffset = this.addSection(pdf, 'Ciljevi i Motivacija', this.dataService.getCiljeviMotivacijaData(), yOffset);
    yOffset = this.addSection(pdf, 'Iskustvo', this.dataService.getExperienceData(), yOffset);
    yOffset = this.addSection(pdf, 'Obrazovanje', this.dataService.getEducationData(), yOffset);
    yOffset = this.addSection(pdf, 'Tehnološki Stack', this.dataService.getTechnologiesData(), yOffset);

    pdf.save('zivotopis.pdf');
  }

  private addSection(pdf: jsPDF, title: string, data: any[], startY: number): number {
    pdf.setFontSize(14);
    pdf.text(title, 10, startY);
    startY += 10;
    pdf.setFontSize(10);

    data.forEach(async (item) => {
      if (item.naziv) pdf.text(item.naziv, 15, startY);
      startY += 5;
      if (item.opis) pdf.text(item.opis, 15, startY, { maxWidth: 180 });
      startY += 10;
      if (item.slika) {
        const img = await this.loadImage(item.slika);
        pdf.addImage(img, 'JPEG', 15, startY, 30, 30);
        startY += 35;
      }
    });

    return startY + 10;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}
