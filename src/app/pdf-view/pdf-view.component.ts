import { Component, Input, signal, WritableSignal, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsobniPodaciComponent } from '../osobni-podaci/osobni-podaci.component';
import { CiljeviMotivacijaComponent } from '../ciljevi-motivacija/ciljevi-motivacija.component';
import { IskustvoComponent } from '../iskustvo/iskustvo.component';
import { ObrazovanjeComponent } from '../obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from '../tehnoloski-stack/tehnoloski-stack.component';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';
import html2canvas from 'html2canvas';
import jsPDF  from 'jspdf';

@Component({
  selector: 'app-pdf-view',
  standalone: true,
  imports: [
    CommonModule,
    OsobniPodaciComponent,
    CiljeviMotivacijaComponent,
    IskustvoComponent,
    ObrazovanjeComponent,
    TehnoloskiStackComponent,
    ProfileHeaderComponent
  ],
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.css']
})
export class PdfViewComponent {
  @Input() slika: string = '';
  @Input() set imePrezime(value: string) {
    this._imePrezime.set(value);
  }
  @Input() set titula(value: string) {
    this._titula.set(value);
  }

  _imePrezime: WritableSignal<string> = signal('');
  _titula: WritableSignal<string> = signal('');

  @ViewChild('pdfContainer') pdfContainer!: ElementRef;
  @Output() pdfGenerated = new EventEmitter<void>();

  async generatePDF() {
    const element = this.pdfContainer.nativeElement;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margin
  
    const pageElements = element.querySelectorAll('.pdf-page');
    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i] as HTMLElement;
      
      // Čekaj da se sve slike učitaju
      await Promise.all(Array.from(pageElement.querySelectorAll('img')).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      }));
  
      // Postavi vidljivost elementa
      pageElement.style.display = 'block';
      
      const canvas = await html2canvas(pageElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.pdf-page') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = `${pageWidth - 2 * margin}mm`;
            clonedElement.style.padding = `${margin}mm`;
            clonedElement.style.backgroundColor = '#f0f0f0';
          }
        }
      });
  
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, pageHeight - 2 * margin);
      
      if (i > 0) {
        pdf.addPage();
      }
  
      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
      pageElement.style.display = '';
    }
  
    pdf.save('zivotopis.pdf');
    this.pdfGenerated.emit();
  }
}
