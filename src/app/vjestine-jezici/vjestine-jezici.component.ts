import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';

interface Vjestina {
  naziv: string;
  razina?: string;
}

interface Certifikat {
  naziv: string;
  datoteka?: string;
}

@Component({
  selector: 'app-vjestine-jezici',
  templateUrl: './vjestine-jezici.component.html',
  styleUrls: ['./vjestine-jezici.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class VjestineJeziciComponent implements OnInit {
  constructor(private dataService: DataService) {}

  ngOnInit() {
    const savedVjestine = this.dataService.getVjestineData();
    const savedCertifikati = this.dataService.getCertifikatiData();

    if (savedVjestine.length > 0) {
      this.vjestine.set(savedVjestine);
    }

    if (savedCertifikati.length > 0) {
      this.certifikati.set(savedCertifikati);
    }
  }

  vjestine = signal<Vjestina[]>([]);
  certifikati = signal<Certifikat[]>([]);

  novaVjestina: Vjestina = { naziv: '', razina: '' };
  noviCertifikat: Certifikat = { naziv: '' };

  createTempUrl(base64String: string): string | null {
    // Provjera da li je base64String ispravno enkodiran
    const isBase64 = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/.test(base64String);
  
    if (!isBase64) {
      console.error('Neispravno enkodirana base64 vrijednost:', base64String);
      return null;
    }
  
    const binaryString = window.atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }
  
  removeDataPrefix(value: string): string {
    const prefixLength = 'data:application/pdf;base64,'.length;
    return value.substring(prefixLength);
  }
  
  dodajVjestinu() {
    this.vjestine.update((vjestine) => {
      const updatedVjestine = [...vjestine, { ...this.novaVjestina }];
      this.dataService.setVjestineData(updatedVjestine);
      return updatedVjestine;
    });
    this.novaVjestina = { naziv: '', razina: '' };
  }

  ukloniVjestinu(index: number) {
    this.vjestine.update((vjestine) => {
      const updatedVjestine = vjestine.filter((_, i) => i !== index);
      this.dataService.setVjestineData(updatedVjestine);
      return updatedVjestine;
    });
  }

  dodajCertifikat() {
    this.certifikati.update((certifikati) => {
      const updatedCertifikati = [...certifikati, { ...this.noviCertifikat }];
      this.dataService.setCertifikatiData(updatedCertifikati);
      return updatedCertifikati;
    });
    this.noviCertifikat = { naziv: '' };
  }

  ukloniCertifikat(index: number) {
    this.certifikati.update((certifikati) => {
      const updatedCertifikati = certifikati.filter((_, i) => i !== index);
      this.dataService.setCertifikatiData(updatedCertifikati);
      return updatedCertifikati;
    });
  }

  odaberiDatoteku(event: Event, certifikat: Certifikat) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          certifikat.datoteka = e.target.result as string;
          this.certifikati.update((certifikati) => {
            const updatedCertifikati = [...certifikati];
            this.dataService.setCertifikatiData(updatedCertifikati);
            return updatedCertifikati;
          });
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
