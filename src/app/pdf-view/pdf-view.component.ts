import { Component, Input, signal, WritableSignal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OsobniPodaciComponent } from '../osobni-podaci/osobni-podaci.component';
import { CiljeviMotivacijaComponent } from '../ciljevi-motivacija/ciljevi-motivacija.component';
import { IskustvoComponent } from '../iskustvo/iskustvo.component';
import { ObrazovanjeComponent } from '../obrazovanje/obrazovanje.component';
import { TehnoloskiStackComponent } from '../tehnoloski-stack/tehnoloski-stack.component';
import { ProfileHeaderComponent } from '../profile-header/profile-header.component';

@Component({
  selector: 'app-pdf-view',
  standalone: true,
  imports: [
    CommonModule,
    OsobniPodaciComponent,
    CiljeviMotivacijaComponent,
    IskustvoComponent,
    ObrazovanjeComponent,
    TehnoloskiStackComponent,
    ProfileHeaderComponent
  ],
  templateUrl: './pdf-view.component.html',
  styleUrls: ['./pdf-view.component.css']
})
export class PdfViewComponent {
  @Input() slika: string = '';
  @Input() set imePrezime(value: string) {
    this._imePrezime.set(value);
  }
  @Input() set titula(value: string) {
    this._titula.set(value);
  }

  _imePrezime: WritableSignal<string> = signal('');
  _titula: WritableSignal<string> = signal('');
}