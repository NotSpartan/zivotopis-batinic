// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthorSignal = signal(true);  // Postavite na false za produkciju

  isAuthor() {
    return this.isAuthorSignal();
  }

  // Metoda za promjenu stanja autora (može se koristiti za testiranje)
  setAuthor(isAuthor: boolean) {
    this.isAuthorSignal.set(isAuthor);
  }
}
