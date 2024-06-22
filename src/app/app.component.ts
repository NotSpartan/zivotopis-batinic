import { Component } from '@angular/core';
import { OsobniPodaciComponent } from './osobni-podaci/osobni-podaci.component';
import { CiljeviMotivacijaComponent } from './ciljevi-motivacija/ciljevi-motivacija.component';
import { IskustvoComponent } from './iskustvo/iskustvo.component';
import { ObrazovanjeComponent } from './obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from './tehnoloski-stack/tehnoloski-stack.component';
import { VjestineJeziciComponent } from './vjestine-jezici/vjestine-jezici.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    OsobniPodaciComponent,
    CiljeviMotivacijaComponent,
    IskustvoComponent,
    ObrazovanjeComponent,
    TehnoloskiStackComponent,
    VjestineJeziciComponent
  ]
})
export class AppComponent {
  title = 'zivotopis-batinic';
}