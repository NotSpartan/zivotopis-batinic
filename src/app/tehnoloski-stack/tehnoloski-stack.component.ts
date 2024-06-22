import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-tehnoloski-stack',
  templateUrl: './tehnoloski-stack.component.html',
  standalone: true,
})
export class TehnoloskiStackComponent {
  tehnologije = signal([
    { naziv: 'Java', ikona: 'path/to/java-icon.svg' },
    { naziv: '.NET', ikona: 'path/to/net-icon.svg' }
  ]);
  // Dodaj metode za uređivanje podataka
}