import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProfileHeaderComponent {
  @Input() slika: string = '';
  @Input() imePrezime: string = '';
  @Input() titula: string = '';
  @Input() isEditing: boolean = false;
  @Input() isAuthor: boolean = false;

  @Output() fileSelected = new EventEmitter<Event>();
  @Output() editToggled = new EventEmitter<void>();

  onFileSelected(event: Event) {
    this.fileSelected.emit(event);
  }

  toggleEdit() {
    this.editToggled.emit();
  }
}
