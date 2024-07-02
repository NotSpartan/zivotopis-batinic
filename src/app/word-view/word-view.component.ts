import { Component, Input, Output, EventEmitter, WritableSignal, signal } from '@angular/core';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  ImageRun, 
  AlignmentType, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  VerticalAlign
} from 'docx';
import { saveAs } from 'file-saver';
import { DataService } from '../services/data.service';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';

@Component({
  selector: 'app-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.css'],
  standalone: true,
  imports: [ProfileHeaderComponent]
})
export class WordViewComponent {
  @Input() slika: string = '';
  @Input() imePrezime: WritableSignal<string> = signal('');
  @Input() titula: WritableSignal<string> = signal('');
  @Output() wordGenerated = new EventEmitter<void>();

  constructor(private dataService: DataService) {}

  async generateWord() {
    const imageParagraph = await this.getImageParagraph();
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: "" }), // Dodaje prazan red za gornji padding
                      imageParagraph,
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: this.imePrezime(),
                            bold: true,
                            size: 28,
                            color: "FFFFFF",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: this.titula(),
                            size: 24,
                            color: "FFFFFF",
                          }),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({ text: "" }), // Dodaje prazan red za donji padding
                    ],
                    shading: {
                      fill: "667eea",
                      type: "clear",
                      color: "auto",
                    },
                    verticalAlign: VerticalAlign.CENTER,
                    margins: {
                      top: 200,
                      bottom: 200,
                      left: 100,
                      right: 100,
                    },
                  }),
                ],
              }),
            ],
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          }),
          // Ovdje možete dodati ostale sekcije dokumenta
        ],
      }],
    });
    // Generirajte Word dokument
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'zivotopis.docx');
    this.wordGenerated.emit();
  }

  private async getImageParagraph(): Promise<Paragraph> {
    if (this.slika) {
      try {
        const imageBlob = await fetch(this.slika).then(r => r.blob());
        const arrayBuffer = await imageBlob.arrayBuffer();
        return new Paragraph({
          children: [
            new ImageRun({
              data: arrayBuffer,
              transformation: {
                width: 100,
                height: 100,
              },
            }),
          ],
          alignment: AlignmentType.CENTER,
        });
      } catch (error) {
        console.error('Error loading image:', error);
      }
    }
    return new Paragraph({}); // Vraća prazan paragraf ako nema slike
  }
}
