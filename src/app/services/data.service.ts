import { Injectable } from '@angular/core';

interface Vjestina {
  naziv: string;
  razina?: string;
}

interface Certifikat {
  naziv: string;
  datoteka?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private educationData: any[] = [];
  private experienceData: any[] = [];
  private tehnologijeData: any[] = [];
  private vjestineData: Vjestina[] = [];
  private certifikatiData: Certifikat[] = [];
  private ciljeviMotivacijaData: string[] = [];

  private osobniPodaciData: any = {
    imePrezime: '',
    titula: '',
    email: '',
    telefon: '',
    socialLinks: [],
    slika: ''
  };

  setEducationData(data: any[]) {
    this.educationData = data;
  }

  getEducationData() {
    return this.educationData;
  }

  setExperienceData(data: any[]) {
    this.experienceData = data;
  }

  getExperienceData() {
    return this.experienceData;
  }

  getTechnologiesData(): any[] {
    return this.tehnologijeData;
  }

  setTechnologiesData(data: any[]): void {
    this.tehnologijeData = data;
  }

  getVjestineData(): Vjestina[] {
    return this.vjestineData;
  }

  setVjestineData(data: Vjestina[]): void {
    this.vjestineData = data;
  }

  getCertifikatiData(): Certifikat[] {
    return this.certifikatiData;
  }

  setCertifikatiData(data: Certifikat[]): void {
    this.certifikatiData = data;
  }

  setOsobniPodaciData(data: any) {
    this.osobniPodaciData = { ...this.osobniPodaciData, ...data };
  }

  getOsobniPodaciData() {
    return this.osobniPodaciData;
  }

  setCiljeviMotivacijaData(data: string[]) {
    this.ciljeviMotivacijaData = data;
  }

  getCiljeviMotivacijaData() {
    return this.ciljeviMotivacijaData;
  }
}
