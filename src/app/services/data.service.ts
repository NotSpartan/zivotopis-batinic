import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private educationData: any[] = [];

  setEducationData(data: any[]) {
    this.educationData = data;
  }

  getEducationData() {
    return this.educationData;
  }
}