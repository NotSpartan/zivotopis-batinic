import { Component, Input, signal, WritableSignal, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OsobniPodaciComponent } from '../osobni-podaci/osobni-podaci.component';
import { CiljeviMotivacijaComponent } from '../ciljevi-motivacija/ciljevi-motivacija.component';
import { IskustvoComponent } from '../iskustvo/iskustvo.component';
import { ObrazovanjeComponent } from '../obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from '../tehnoloski-stack/tehnoloski-stack.component';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

  constructor(private http: HttpClient) {}

  async generatePDF() {
    const element = this.pdfContainer.nativeElement;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    try {
      await this.loadAndAddFonts(pdf);
      await this.prepareDocument(element);
      await this.generatePDFPages(pdf, element, pageWidth, pageHeight, margin);
      this.finalizePDF(pdf);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.cleanupAfterGeneration(element);
    }
  }

  private async loadAndAddFonts(pdf: jsPDF): Promise<void> {
    const dancingScriptFont = await this.loadFont('assets/fonts/DancingScript-Regular.ttf');
    const regularFont = await this.loadFont('assets/fonts/Roboto-Regular.ttf');

    pdf.addFileToVFS('DancingScript-Regular.ttf', dancingScriptFont);
    pdf.addFileToVFS('Roboto-Regular.ttf', regularFont);

    pdf.addFont('DancingScript-Regular.ttf', 'DancingScript', 'normal');
    pdf.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

    pdf.setFont('Roboto');
  }

  private async loadFont(fontPath: string): Promise<string> {
    const fontResponse = await fetch(fontPath);
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(fontArrayBuffer)));
  }

  private async prepareDocument(element: HTMLElement): Promise<void> {
    element.classList.add('generating-pdf');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async generatePDFPages(pdf: jsPDF, element: HTMLElement, pageWidth: number, pageHeight: number, margin: number): Promise<void> {
    const pageElements = element.querySelectorAll('.pdf-page');
    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i] as HTMLElement;
      await this.addPageToPDF(pdf, pageElement, pageWidth, pageHeight, margin);
      if (i < pageElements.length - 1) {
        pdf.addPage();
      }
    }
  }
  private async addPageToPDF(pdf: jsPDF, pageElement: HTMLElement, pageWidth: number, pageHeight: number, margin: number): Promise<void> {
    await this.waitForImages(pageElement);
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      width: pageWidth - 2 * margin,
      height: pageElement.offsetHeight,
      x: margin,
      y: 0,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, '', 'FAST');

    this.applyDancingScriptFont(pdf, pageElement, margin);
  }

  private async waitForImages(element: HTMLElement): Promise<void> {
    const images = element.getElementsByTagName('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      } else {
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      }
    });
    await Promise.all(promises);
  }

  private applyDancingScriptFont(pdf: jsPDF, pageElement: HTMLElement, margin: number): void {
    const motivationElements = pageElement.querySelectorAll('.pdf-motivation-text');
    motivationElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      const text = htmlEl.textContent || '';
      const x = margin + parseFloat(getComputedStyle(htmlEl).marginLeft);
      const y = margin + htmlEl.offsetTop + parseFloat(getComputedStyle(htmlEl).fontSize);

      pdf.setFont('DancingScript');
      pdf.setFontSize(11);
      pdf.setTextColor(58, 58, 58); // #3a3a3a
      pdf.text(text, x, y);
      pdf.setFont('Roboto'); // Vraćanje na zadani font
    });
  }

  private finalizePDF(pdf: jsPDF): void {
    pdf.save('zivotopis.pdf');
    this.pdfGenerated.emit();
  }

  private handleError(error: any): void {
    console.error('Error generating PDF:', error);
    // Ovdje možete dodati dodatno rukovanje pogreškama, npr. prikazivanje poruke korisniku
  }

  private cleanupAfterGeneration(element: HTMLElement): void {
    element.classList.remove('generating-pdf');
  }
}



