import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'cb-dialog-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './dialog-header.component.html',
  styleUrl: './dialog-header.component.scss',
})
export class DialogHeaderComponent {
  @Input() action!: string;
  @Input() key!: string;
  @Input() profileModal: boolean = true;

  constructor(public dialogRef: MatDialogRef<any>) {}

  handelModalClose() {
    this.dialogRef.close({ event: 'close' });
  }
}
