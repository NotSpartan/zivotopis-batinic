import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private educationData: any[] = [];
  private experienceData: any[] = [];

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
}
