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
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    PdfViewComponent,
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
  
  ngOnInit() {
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
  
  async generatePDF() {
    this.isGeneratingPDF.set(true);
    
    // Pričekajte da se DOM ažurira
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    const element = document.querySelector('.pdf-container');
    if (element) {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const pageElements = element.querySelectorAll('.pdf-page');
      for (let i = 0; i < pageElements.length; i++) {
        const pageElement = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });
  
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const imgWidth = pdfWidth;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
  
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }
  
      pdf.save('zivotopis.pdf');
    }
  
    this.isGeneratingPDF.set(false);
  }
}
