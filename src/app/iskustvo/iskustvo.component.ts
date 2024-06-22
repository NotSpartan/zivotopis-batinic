import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-iskustvo',
  templateUrl: './iskustvo.component.html',
  standalone: true,
})
export class IskustvoComponent {
  iskustva = signal([
    { posao: 'Krupije', tvrtka: 'Hrvatska lutrija', period: 'December 2017 - February 2019', mjesto: 'Zagreb' },
    { posao: 'Viši stručni suradnik za protokol', tvrtka: 'Zagrebačka županija', period: 'January 2016 - January 2017', mjesto: 'Zagreb' },
    { posao: 'Zamjenik poslovođe', tvrtka: 'OREMAR d.o.o.', period: 'May 2014 - April 2015', mjesto: 'Zagreb' }
  ]);
  // Dodaj metode za uređivanje podataka
}