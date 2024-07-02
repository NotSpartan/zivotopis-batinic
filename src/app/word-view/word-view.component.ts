import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-word-view',
  templateUrl: './word-view.component.html',
  styleUrls: ['./word-view.component.css'],
  standalone: true
})
export class WordViewComponent {
  @Input() slika: string = '';
  @Input() imePrezime: string = '';
  @Input() titula: string = '';
  @Output() wordGenerated = new EventEmitter<void>();

  constructor(private dataService: DataService) {}

  async generateWord() {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: this.imePrezime,
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: this.titula,
                size: 24,
              }),
            ],
          }),
          // Dodajte ostale sekcije ovdje
        ],
      }],
    });

    // Generirajte Word dokument
    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'zivotopis.docx');
    this.wordGenerated.emit();
  }
}
