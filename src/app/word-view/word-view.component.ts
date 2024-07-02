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
import { OsobniPodaciComponent } from '../osobni-podaci/osobni-podaci.component';

interface SocialLink {
  platform: string;
  url: string;
}

@Component({
  selector: 'app-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.css'],
  standalone: true,
  imports: [ProfileHeaderComponent, OsobniPodaciComponent]
})
export class WordViewComponent {
  @Input() slika: string = '';
  @Input() imePrezime: WritableSignal<string> = signal('');
  @Input() titula: WritableSignal<string> = signal('');
  @Output() wordGenerated = new EventEmitter<void>();

  constructor(private dataService: DataService) {}

  async generateWord() {
    const imageParagraph = await this.getImageParagraph();
    const osobniPodaciParagraphs = this.getOsobniPodaciParagraphs();
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          this.createHeaderTable(imageParagraph),
          ...osobniPodaciParagraphs,
        ],
      }],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'zivotopis.docx');
    this.wordGenerated.emit();
  }

  private createHeaderTable(imageParagraph: Paragraph): Table {
    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: "" }), // Gornji padding
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
                new Paragraph({ text: "" }), // Donji padding
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
    });
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

  private getOsobniPodaciParagraphs(): Paragraph[] {
    const osobniPodaci = this.dataService.getOsobniPodaciData();
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: "Osobni podaci",
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      })
    );

    const fields = [
      { icon: "Osoba:", value: osobniPodaci.imePrezime },
      { icon: "Pozicija:", value: osobniPodaci.titula },
      { icon: "Telefon:", value: osobniPodaci.telefon },
      { icon: "E-pošta:", value: osobniPodaci.email },
    ];

    fields.forEach(field => {
      if (field.value) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${field.icon} `,
                bold: true,
              }),
              new TextRun(field.value),
            ],
          })
        );
      }
    });

    if (osobniPodaci.socialLinks && osobniPodaci.socialLinks.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Društvene mreže:",
              bold: true,
            }),
          ],
        })
      );

      osobniPodaci.socialLinks.forEach((link: SocialLink) => {
        paragraphs.push(
          new Paragraph({
            text: `${link.platform}: ${link.url}`,
          })
        );
      });
    }

    if (osobniPodaci.ciljevi) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Ciljevi:",
              bold: true,
            }),
          ],
        }),
        new Paragraph({
          text: osobniPodaci.ciljevi,
        })
      );
    }

    return paragraphs;
  }
}
