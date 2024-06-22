import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-obrazovanje',
  templateUrl: './obrazovanje.component.html',
  standalone: true,
})
export class ObrazovanjeComponent {
  obrazovanja = signal([
    { naziv: 'Salesforce Administrator', ustanova: 'Simplilearn', godina: '2019', mjesto: 'Raleigh' },
    { naziv: 'Računalni programer internet aplikacija', ustanova: 'Algebra', godina: '2019', mjesto: 'Zagreb' },
    { naziv: 'Viši stručni suradnik', ustanova: 'Ministarstvo uprave', godina: '2016', mjesto: 'Zagreb' },
    { naziv: 'Magistar edukacije povijesti', ustanova: 'Hrvatski studiji', godina: '2012', mjesto: 'Zagreb' },
    { naziv: 'Prvostupnik komunikologije', ustanova: 'Hrvatski studiji', godina: '2009', mjesto: 'Zagreb' }
  ]);
  // Dodaj metode za uređivanje podataka
}