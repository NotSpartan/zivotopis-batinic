import { Component, Input, Output, EventEmitter, WritableSignal, signal, OnInit } from '@angular/core';
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
import { IskustvoComponent } from '../iskustvo/iskustvo.component';

interface SocialLink {
  platform: string;
  url: string;
}

@Component({
  selector: 'app-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.css'],
  standalone: true,
  imports: [ProfileHeaderComponent, OsobniPodaciComponent, IskustvoComponent]
})
export class WordViewComponent implements OnInit {
  @Input() slika: string = '';
  @Input() imePrezime: WritableSignal<string> = signal('');
  @Input() titula: WritableSignal<string> = signal('');
  @Output() wordGenerated = new EventEmitter<void>();

  osobniPodaci: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.osobniPodaci = this.dataService.getOsobniPodaciData();
    console.log('Osobni podaci u WordViewComponent:', this.osobniPodaci);
  }

  async generateWord() {
    console.log('Generating Word document...');
    const imageParagraph = await this.getImageParagraph();
    const osobniPodaciParagraphs = await this.getOsobniPodaciParagraphs();
    const iskustvoElements = await this.getIskustvoParagraphs();
  
    console.log('Iskustvo elements:', iskustvoElements); // Dodajte ovu liniju za debugging
  
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          this.createHeaderTable(imageParagraph),
          ...osobniPodaciParagraphs,
          new Paragraph({ text: '', spacing: { after: 100 } }),
          ...iskustvoElements,
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
                      size: 24,
                      color: "FFFFFF",
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: this.titula(),
                      size: 20,
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
                top: 100,
                bottom: 100,
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

  private async getSocialIconImageRun(platform: string): Promise<ImageRun | null> {
    const iconPath = `assets/${platform.toLowerCase()}-icon.png`;
    try {
      const response = await fetch(iconPath);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return new ImageRun({
        data: arrayBuffer,
        transformation: {
          width: 16,
          height: 16,
        },
      });
    } catch (error) {
      console.error(`Error loading icon for ${platform}:`, error);
      return null;
    }
  }

  private async getIskustvoParagraphs(): Promise<(Paragraph | Table)[]> {
    console.log('Generating iskustvo paragraphs...');
    const elements: (Paragraph | Table)[] = [
      new Paragraph({ text: '', spacing: { before: 200 } })
    ];
    const iskustvoData = await this.dataService.getExperienceData();
  
    elements.push(
      new Paragraph({
        text: "Radno iskustvo",
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      })
    );
  
    for (const iskustvo of iskustvoData) {
      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              children: [
                await this.getCompanyIconParagraph(iskustvo.companyIcon),
              ],
              width: {
                size: 10,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: iskustvo.position,
                      bold: true
                    })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: iskustvo.company
                    })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${iskustvo.startDate} - ${iskustvo.endDate || 'Trenutno'}`,
                      italics: true
                    })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: iskustvo.location
                    })
                  ]
                }),
              ],
              width: {
                size: 90,
                type: WidthType.PERCENTAGE,
              },
            }),
          ],
        }),
      ];
  
      const table = new Table({
        rows: tableRows,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
      });
  
      elements.push(table);
  
      // Dodajte odgovornosti ako postoje
      if (iskustvo.responsibilities && iskustvo.responsibilities.length > 0) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Odgovornosti:",
                bold: true
              })
            ],
            bullet: { level: 0 },
          })
        );
  
        for (const responsibility of iskustvo.responsibilities) {
          elements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: responsibility
                })
              ],
              bullet: { level: 1 },
            })
          );
        }
      }
  
      elements.push(new Paragraph({ text: '', spacing: { after: 200 } })); // Razmak između iskustava
    }
  
    return elements;
  }
  
  private async getCompanyIconParagraph(iconPath: string | undefined): Promise<Paragraph> {
    if (iconPath) {
      try {
        const response = await fetch(iconPath);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        return new Paragraph({
          children: [
            new ImageRun({
              data: arrayBuffer,
              transformation: {
                width: 50,
                height: 50,
              },
            }),
          ],
        });
      } catch (error) {
        console.error('Error loading company icon:', error);
      }
    }
    return new Paragraph({}); // Vraća prazan paragraf ako nema ikone
  }

  private async getOsobniPodaciParagraphs(): Promise<Paragraph[]> {
    console.log('Generating osobni podaci paragraphs...');
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        text: "Osobni podaci",
        heading: HeadingLevel.HEADING_2,
        thematicBreak: true,
      })
    );

    const fields = [
      { icon: "Osoba:", value: this.osobniPodaci.imePrezime },
      { icon: "Pozicija:", value: this.osobniPodaci.titula },
      { icon: "Telefon:", value: this.osobniPodaci.telefon },
      { icon: "E-pošta:", value: this.osobniPodaci.email },
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

    if (this.osobniPodaci.socialLinks && this.osobniPodaci.socialLinks.length > 0) {
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

      for (const link of this.osobniPodaci.socialLinks) {
        const iconRun = await this.getSocialIconImageRun(link.platform);
        const paragraphChildren: (ImageRun | TextRun)[] = [];
        
        if (iconRun) {
          paragraphChildren.push(iconRun);
        }
        
        paragraphChildren.push(
          new TextRun({
            text: ` ${link.platform}: ${link.url}`,
          })
        );
  
        const paragraph = new Paragraph({
          children: paragraphChildren,
        });
        paragraphs.push(paragraph);
      }
    }

    if (this.osobniPodaci.ciljevi) {
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
          text: this.osobniPodaci.ciljevi,
        })
      );
    }

    return paragraphs;
  }
}
