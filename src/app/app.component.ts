import { Component, WritableSignal, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsobniPodaciComponent } from './osobni-podaci/osobni-podaci.component';
import { CiljeviMotivacijaComponent } from './ciljevi-motivacija/ciljevi-motivacija.component';
import { IskustvoComponent } from './iskustvo/iskustvo.component';
import { ObrazovanjeComponent } from './obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from './tehnoloski-stack/tehnoloski-stack.component';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { DataService } from './services/data.service';
import { PdfViewComponent } from './pdf-view/pdf-view.component';
import { WordViewComponent } from './word-view/word-view.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    PdfViewComponent,
    WordViewComponent,
    OsobniPodaciComponent,
    CiljeviMotivacijaComponent,
    IskustvoComponent,
    ObrazovanjeComponent,
    TehnoloskiStackComponent,
    ProfileHeaderComponent
  ]
})
export class AppComponent {
  private dataService = inject(DataService);

  activeTab = signal('osobni-podaci');
  imePrezime: WritableSignal<string> = signal('Josip Batinić');
  titula: WritableSignal<string> = signal('Software Developer');
  slika = signal('assets/default-profile.png');
  isAuthor = signal(true);
  isGeneratingPDF = signal(false);
  isGeneratingWord = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const data = this.dataService.getOsobniPodaciData();
    this.imePrezime.set(data.imePrezime || 'Josip Batinić');
    this.titula.set(data.titula || 'Software Developer');
    this.slika.set(data.slika || 'assets/default-profile.png');
  }

  updateSlika(novaSlika: string) {
    this.slika.set(novaSlika);
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      slika: novaSlika,
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  updateImePrezime(newImePrezime: string) {
    this.imePrezime.set(newImePrezime);
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      imePrezime: newImePrezime,
    });
  }

  updateTitula(newTitula: string) {
    this.titula.set(newTitula);
    this.dataService.setOsobniPodaciData({
      ...this.dataService.getOsobniPodaciData(),
      titula: newTitula,
    });
  }

  generatePDF() {
    this.isGeneratingPDF.set(true);
    document.body.classList.add('pdf-mode');
  }

  onPdfGenerated() {
    this.isGeneratingPDF.set(false);
    document.body.classList.remove('pdf-mode');
  }

  generateWord() {
    this.isGeneratingWord.set(true);
    document.body.classList.add('word-mode');
  }

  onWordGenerated() {
    this.isGeneratingWord.set(false);
    document.body.classList.remove('word-mode');
  }
}
