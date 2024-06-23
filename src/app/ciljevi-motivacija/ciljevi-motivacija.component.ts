import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ciljevi-motivacija',
  template: `
    <div class="ciljevi-motivacija">
      <h3>Ciljevi i motivacija</h3>
      <ng-container *ngIf="!isEditing; else editMode">
        <p>{{ ciljevi }}</p>
      </ng-container>
      <ng-template #editMode>
        <textarea [(ngModel)]="editableCiljevi" rows="4"></textarea>
      </ng-template>
    </div>
  `,
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class CiljeviMotivacijaComponent {
  @Input() ciljevi: string = '';
  @Input() isEditing: boolean = false;
  @Output() ciljeviChange = new EventEmitter<string>();

  editableCiljevi: string = '';

  ngOnChanges() {
    if (this.isEditing) {
      this.editableCiljevi = this.ciljevi;
    } else {
      if (this.editableCiljevi !== this.ciljevi) {
        this.ciljeviChange.emit(this.editableCiljevi);
      }
    }
  }
}
