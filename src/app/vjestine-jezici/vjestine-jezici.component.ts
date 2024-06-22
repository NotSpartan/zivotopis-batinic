import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-vjestine-jezici',
  templateUrl: './vjestine-jezici.component.html',
  standalone: true,
})
export class VjestineJeziciComponent {
  vjestine = signal(['Salesforce CRM', 'Apex', 'Visualforce', '.NET Framework', 'Entity Framework']);
  jezici = signal(['Engleski - Napredno']);
  // Dodaj metode za uređivanje podataka
}