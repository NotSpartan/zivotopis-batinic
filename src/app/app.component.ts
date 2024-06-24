import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsobniPodaciComponent } from './osobni-podaci/osobni-podaci.component';
import { CiljeviMotivacijaComponent } from './ciljevi-motivacija/ciljevi-motivacija.component';
import { IskustvoComponent } from './iskustvo/iskustvo.component';
import { ObrazovanjeComponent } from './obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from './tehnoloski-stack/tehnoloski-stack.component';
import { VjestineJeziciComponent } from './vjestine-jezici/vjestine-jezici.component';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { DataService } from './services/data.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    OsobniPodaciComponent,
    CiljeviMotivacijaComponent,
    IskustvoComponent,
    ObrazovanjeComponent,
    TehnoloskiStackComponent,
    VjestineJeziciComponent,
    ProfileHeaderComponent
  ]
})
export class AppComponent {
  constructor(private dataService: DataService) {}
  activeTab = signal('osobni-podaci'); 

  imePrezime = signal('Josip Batinić');
  titula = signal('Software Developer');
  slika = signal('assets/default-profile.png');
  isAuthor = signal(true);

updateSlika(novaSlika: string) {
  this.slika.set(novaSlika);
}

setActiveTab(tab: string) {
  this.activeTab.set(tab);
}

updateImePrezime(newImePrezime: string) {
  this.imePrezime.set(newImePrezime);
}

updateTitula(newTitula: string) {
  this.titula.set(newTitula);
}


}
