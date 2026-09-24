import { MatDialogConfig } from '@angular/material/dialog';

export const DIALOG_CONFIG: Record<string, MatDialogConfig> = {
  SMALL_DIALOG: {
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    panelClass: 'template-dialog-panel'
  },
  MEDIUM_DIALOG: {
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    panelClass: 'template-dialog-panel'
  },
  LARGE_DIALOG: {
    width: '800px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    panelClass: 'template-dialog-panel'
  },
  DELETE: {
    width: '400px',
    maxWidth: '90vw',
    panelClass: 'template-dialog-panel'
  }
};
