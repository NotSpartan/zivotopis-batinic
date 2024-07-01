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
      const fontBase64 = await this.loadFont();
      this.addFontToPDF(pdf, fontBase64);
      await this.generatePDFPages(pdf, element, pageWidth, pageHeight, margin);
      this.finalizePDF(pdf);
    } catch (error) {
      this.handleError(error);
    }
  }

  private async loadFont(): Promise<string> {
    const fontPath = 'assets/fonts/DancingScript-Regular.ttf';
    const fontResponse = await fetch(fontPath);
    const fontArrayBuffer = await fontResponse.arrayBuffer();
    return btoa(String.fromCharCode(...new Uint8Array(fontArrayBuffer)));
  }

  private addFontToPDF(pdf: jsPDF, fontBase64: string): void {
    pdf.addFileToVFS('DancingScript-Regular.ttf', fontBase64);
    pdf.addFont('DancingScript-Regular.ttf', 'DancingScript', 'normal');
  }

  private async generatePDFPages(pdf: jsPDF, element: HTMLElement, pageWidth: number, pageHeight: number, margin: number): Promise<void> {
    const pageElements = element.querySelectorAll('.pdf-page');
    let yOffset = margin;
    let currentPage = 1;

    for (let i = 0; i < pageElements.length; i++) {
      const pageElement = pageElements[i] as HTMLElement;
      await this.processPageElement(pdf, pageElement, currentPage, pageWidth, pageHeight, margin, yOffset);
      
      if (yOffset + pageElement.offsetHeight > pageHeight - margin) {
        pdf.addPage();
        currentPage++;
        yOffset = margin;
      } else {
        yOffset += pageElement.offsetHeight + 5;
      }
    }
  }

  private async processPageElement(pdf: jsPDF, pageElement: HTMLElement, pageIndex: number, pageWidth: number, pageHeight: number, margin: number, yOffset: number): Promise<void> {
    await this.waitForImages(pageElement);
    pageElement.style.display = 'block';
    const canvas = await this.createCanvas(pageElement, pageWidth, pageHeight, margin);
    this.addImageToPDF(pdf, canvas, pageIndex, pageWidth, pageHeight, margin, yOffset);
    pageElement.style.display = '';
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

  private async createCanvas(element: HTMLElement, pageWidth: number, pageHeight: number, margin: number): Promise<HTMLCanvasElement> {
    const scale = 2;
    return html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: pageWidth - 2 * margin,
      height: element.offsetHeight,
      x: margin,
      y: 0,
      onclone: (clonedDoc) => {
        this.styleClonedElement(clonedDoc, pageWidth, margin);
      }
    });
  }

  private styleClonedElement(clonedDoc: Document, pageWidth: number, margin: number): void {
    const clonedElement = clonedDoc.querySelector('.pdf-page') as HTMLElement;
    if (clonedElement) {
      clonedElement.style.width = `${pageWidth - 2 * margin}pt`;
      clonedElement.style.padding = `${margin}pt`;
      clonedElement.style.backgroundColor = '#ffffff';
    }
    
    // Dodajte ove linije
    const items = clonedDoc.querySelectorAll('.tehnologija-item, .experience-item, .education-item');
    items.forEach((item: Element) => {
      (item as HTMLElement).style.borderLeft = '2px solid #28a745';
      (item as HTMLElement).style.paddingLeft = '8px';
      (item as HTMLElement).style.marginBottom = '8px';
    });
  
    this.styleMotivationElements(clonedDoc);
  }
  private styleMotivationElements(clonedDoc: Document): void {
    const motivationElements = clonedDoc.querySelectorAll('.motivation-item p');
    motivationElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.fontFamily = 'DancingScript, cursive';
      htmlEl.style.fontSize = '11pt';
      htmlEl.style.lineHeight = '1.2';
      htmlEl.style.color = '#3a3a3a';
    });
  }

  private addImageToPDF(pdf: jsPDF, canvas: HTMLCanvasElement, pageIndex: number, pageWidth: number, pageHeight: number, margin: number, yOffset: number): void {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    if (yOffset + imgHeight > pageHeight - margin) {
      pdf.addPage();
      yOffset = margin;
    }
    
    pdf.addImage(imgData, 'JPEG', margin, yOffset, imgWidth, imgHeight, '', 'FAST');
  }

  private finalizePDF(pdf: jsPDF): void {
    pdf.save('zivotopis.pdf');
    this.pdfGenerated.emit();
  }

  private handleError(error: any): void {
    console.error('Error generating PDF:', error);
  }
}
