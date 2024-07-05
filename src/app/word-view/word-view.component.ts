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
import { ObrazovanjeComponent } from '../obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from '../tehnoloski-stack/tehnoloski-stack.component';
import { CiljeviMotivacijaComponent } from '../ciljevi-motivacija/ciljevi-motivacija.component';

@Component({
  selector: 'app-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.css'],
  standalone: true,
  imports: [ProfileHeaderComponent, OsobniPodaciComponent, IskustvoComponent, ObrazovanjeComponent, TehnoloskiStackComponent, CiljeviMotivacijaComponent]
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
    const obrazovanjeElements = await this.getObrazovanjeParagraphs();
    const tehnoloskiStackElements = await this.getTehnoloskiStackParagraphs();
    const ciljeviMotivacijaElements = await this.getCiljeviMotivacijaParagraphs();

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "motivacijaStyle",
            name: "Motivacija Style",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
              font: "Segoe Script, Freestyle Script, Brush Script MT",
              size: 24,
              color: "000000",
              italics: true
            },
            paragraph: {
              spacing: { after: 60, line: 240 }
            }
          },
          {
            id: "sectionHeading",
            name: "Section Heading",
            basedOn: "Heading2",
            next: "Normal",
            quickFormat: true,
            run: {
              size: 24,
              bold: true,
              color: "0000FF",  // Plava boja
            },
            paragraph: {
              spacing: { before: 20, after: 0, line: 240 }
            }
          }
        ]
      },
      sections: [{
        properties: {},
        children: [
          this.createHeaderTable(imageParagraph),
          ...osobniPodaciParagraphs,
          new Paragraph({ text: '', spacing: { before: 10, after: 10 } }),
          ...iskustvoElements,
          new Paragraph({ text: '', spacing: { before: 10, after: 10 } }),
          ...obrazovanjeElements,
          new Paragraph({ text: '', spacing: { before: 10, after: 10 } }),
          ...tehnoloskiStackElements,
          new Paragraph({ text: '', spacing: { before: 10, after: 10 } }),
          ...ciljeviMotivacijaElements,
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
                top: 30,
                bottom: 30,
                left: 30,
                right: 30,
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
    return new Paragraph({});
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
  private async getCiljeviMotivacijaParagraphs(): Promise<Paragraph[]> {
    console.log('Generating ciljevi i motivacija paragraphs...');
    const paragraphs: Paragraph[] = [];
    const ciljeviMotivacijaData = await this.dataService.getCiljeviMotivacijaData();

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Ciljevi i Motivacija",
            size: 24,
            bold: true,
            color: "0000FF",
          }),
        ],
        style: "sectionHeading",
        spacing: { after: 10 },
        border: {
          bottom: {
            color: "0000FF",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );

    for (const motivacija of ciljeviMotivacijaData) {
      paragraphs.push(
        new Paragraph({
          text: motivacija,
          style: "motivacijaStyle",
          spacing: { before: 10, after: 10 }
        })
      );
    }

    return paragraphs;
  }

  private async getObrazovanjeParagraphs(): Promise<(Paragraph | Table)[]> {
    console.log('Generating obrazovanje paragraphs...');
    const elements: (Paragraph | Table)[] = [];
    const obrazovanjeData = await this.dataService.getEducationData();
 
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Obrazovanje",
            size: 24,
            bold: true,
            color: "0000FF",
          }),
        ],
        style: "sectionHeading",
        spacing: { after: 10 },
        border: {
          bottom: {
            color: "0000FF",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
 
    for (const obrazovanje of obrazovanjeData) {
      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              children: [
                await this.getInstitutionIconParagraph(obrazovanje.institutionIcon),
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
                    new TextRun({ text: obrazovanje.title, bold: true })
                  ],
                  spacing: { before: 10, after: 10 }
                }),
                new Paragraph({
                  text: obrazovanje.institution,
                  spacing: { before: 10, after: 10 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: obrazovanje.year,
                      italics: true
                    })
                  ],
                  spacing: { before: 10, after: 10 }
                }),
                new Paragraph({
                  text: obrazovanje.location,
                  spacing: { before: 10, after: 10 }
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
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
      });
 
      elements.push(table);
 
      if (obrazovanje.description) {
        elements.push(
          new Paragraph({
            text: obrazovanje.description,
            spacing: { before: 10, after: 10 }
          })
        );
      }
 
      if (obrazovanje.bulletPoints && obrazovanje.bulletPoints.length > 0) {
        for (const point of obrazovanje.bulletPoints) {
          elements.push(
            new Paragraph({
              text: point,
              bullet: { level: 0 },
              spacing: { before: 5, after: 5 }
            })
          );
        }
      }
    }
 
    return elements;
  }
  private async getInstitutionIconParagraph(iconPath: string | undefined): Promise<Paragraph> {
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
        console.error('Error loading institution icon:', error);
      }
    }
    return new Paragraph({});
  }

  private async getIskustvoParagraphs(): Promise<(Paragraph | Table)[]> {
    console.log('Generating iskustvo paragraphs...');
    const elements: (Paragraph | Table)[] = [];
    const iskustvoData = this.dataService.getExperienceData();

    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Radno iskustvo",
            size: 24,
            bold: true,
            color: "0000FF",
          }),
        ],
        style: "sectionHeading",
        spacing: { after: 10 },
        border: {
          bottom: {
            color: "0000FF",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
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
                    new TextRun({ text: iskustvo.position, bold: true })
                  ],
                  spacing: { before: 10, after: 10 }
                }),
                new Paragraph({
                  text: iskustvo.company,
                  spacing: { before: 10, after: 10 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${iskustvo.startDate} - ${iskustvo.endDate || 'Trenutno'}`,
                      italics: true
                    })
                  ],
                  spacing: { before: 10, after: 10 }
                }),
                new Paragraph({
                  text: iskustvo.location,
                  spacing: { before: 10, after: 10 }
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
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
      });
      elements.push(table);

      if (iskustvo.responsibilities && iskustvo.responsibilities.length > 0) {
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "Odgovornosti:",
                bold: true
              })
            ],
            spacing: { before: 10, after: 5 }
          })
        );

        for (const responsibility of iskustvo.responsibilities) {
          elements.push(
            new Paragraph({
              text: responsibility,
              bullet: { level: 0 },
              spacing: { before: 5, after: 5 }
            })
          );
        }
      }
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
    return new Paragraph({});
  }

  private async getOsobniPodaciParagraphs(): Promise<Paragraph[]> {
    console.log('Generating osobni podaci paragraphs...');
    const paragraphs: Paragraph[] = [];

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Osobni podaci",
            size: 24,
            bold: true,
            color: "0000FF",
          }),
        ],
        style: "sectionHeading",
        spacing: { after: 10 },
        border: {
          bottom: {
            color: "0000FF",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
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
            spacing: { before: 10, after: 10 }
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
          spacing: { before: 10, after: 5 }
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
          spacing: { before: 5, after: 5 }
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
          spacing: { before: 10, after: 5 }
        }),
        new Paragraph({
          text: this.osobniPodaci.ciljevi,
          spacing: { before: 5, after: 10 }
        })
      );
    }

    return paragraphs;
  }

  private async getTehnoloskiStackParagraphs(): Promise<(Paragraph | Table)[]> {
    console.log('Generating tehnoloski stack paragraphs...');
    const elements: (Paragraph | Table)[] = [];
    const tehnologijeData = this.dataService.getTechnologiesData();
 
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Tehnološki Stack",
            size: 24,
            bold: true,
            color: "0000FF",
          }),
        ],
        style: "sectionHeading",
        spacing: { after: 10 },
        border: {
          bottom: {
            color: "0000FF",
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      })
    );
 
    for (const tehnologija of tehnologijeData) {
      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({
              children: [
                await this.getTechnologyIconParagraph(tehnologija.ikona),
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
                    new TextRun({ text: tehnologija.naziv, bold: true })
                  ],
                  spacing: { before: 10, after: 5 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: tehnologija.razina,
                      italics: true
                    })
                  ],
                  spacing: { before: 5, after: 10 }
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
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
      });
 
      elements.push(table);
 
      if (tehnologija.opis) {
        elements.push(
          new Paragraph({
            text: tehnologija.opis,
            spacing: { before: 5, after: 5 }
          })
        );
      }
 
      if (tehnologija.bulletPoints && tehnologija.bulletPoints.length > 0) {
        for (const point of tehnologija.bulletPoints) {
          elements.push(
            new Paragraph({
              text: point,
              bullet: { level: 0 },
              spacing: { before: 5, after: 5 }
            })
          );
        }
      }
    }
 
    return elements;
  }

  private async getTechnologyIconParagraph(iconPath: string | undefined): Promise<Paragraph> {
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
                width: 30,
                height: 30,
              },
            }),
          ],
        });
      } catch (error) {
        console.error('Error loading technology icon:', error);
      }
    }
    return new Paragraph({});
  }
}
