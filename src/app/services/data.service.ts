import { Injectable } from '@angular/core';

interface Vjestina {
  naziv: string;
  razina?: string;
}

interface Certifikat {
  naziv: string;
  datoteka?: string;
}

interface Iskustvo {
  id: number;
  startDate: string;
  endDate: string;
  position: string;
  company: string;
  location: string;
  responsibilities: string[];
  companyIcon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private educationData: any[] = [];
  private experienceData: Iskustvo[] = [];
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
    localStorage.setItem('educationData', JSON.stringify(data));
  }

  getEducationData() {
    const data = localStorage.getItem('educationData');
    console.log('Raw education data from localStorage:', data);
    return data ? JSON.parse(data) : this.educationData;
  }

  setExperienceData(data: Iskustvo[]) {
    this.experienceData = data;
    localStorage.setItem('experienceData', JSON.stringify(data));
  }

  getExperienceData(): Iskustvo[] {
    const data = localStorage.getItem('experienceData');
    console.log('Raw experience data from localStorage:', data);
    return data ? JSON.parse(data) : this.experienceData;
  }

  getTechnologiesData(): any[] {
    const data = localStorage.getItem('technologiesData');
    console.log('Raw technologies data from localStorage:', data);
    return data ? JSON.parse(data) : this.tehnologijeData;
  }

  setTechnologiesData(data: any[]): void {
    this.tehnologijeData = data;
    localStorage.setItem('technologiesData', JSON.stringify(data));
  }

  getVjestineData(): Vjestina[] {
    const data = localStorage.getItem('vjestineData');
    console.log('Raw vjestine data from localStorage:', data);
    return data ? JSON.parse(data) : this.vjestineData;
  }

  setVjestineData(data: Vjestina[]): void {
    this.vjestineData = data;
    localStorage.setItem('vjestineData', JSON.stringify(data));
  }

  getCertifikatiData(): Certifikat[] {
    const data = localStorage.getItem('certifikatiData');
    console.log('Raw certifikati data from localStorage:', data);
    return data ? JSON.parse(data) : this.certifikatiData;
  }

  setCertifikatiData(data: Certifikat[]): void {
    this.certifikatiData = data;
    localStorage.setItem('certifikatiData', JSON.stringify(data));
  }

  setOsobniPodaciData(data: any) {
    this.osobniPodaciData = { ...this.osobniPodaciData, ...data };
    localStorage.setItem('osobniPodaciData', JSON.stringify(this.osobniPodaciData));
  }

  getOsobniPodaciData() {
    const data = localStorage.getItem('osobniPodaciData');
    console.log('Raw osobni podaci data from localStorage:', data);
    return data ? JSON.parse(data) : this.osobniPodaciData;
  }

  setCiljeviMotivacijaData(data: string[]) {
    this.ciljeviMotivacijaData = data;
    localStorage.setItem('ciljeviMotivacijaData', JSON.stringify(data));
  }

  getCiljeviMotivacijaData() {
    const data = localStorage.getItem('ciljeviMotivacijaData');
    console.log('Raw ciljevi motivacija data from localStorage:', data);
    return data ? JSON.parse(data) : this.ciljeviMotivacijaData;
  }
}
