import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/common/auth/auth.service';
import { ThemeService } from '../../../core/common/theme/theme.service';
import { Router, RouterLink } from '@angular/router';
import { LogoutConfirmationComponent } from '../../../shared/components/logout-confirmation/logout-confirmation.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink, MatDialogModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  authService = inject(AuthService);
  themeService = inject(ThemeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  logout() {
    const dialogRef = this.dialog.open(LogoutConfirmationComponent, {
      width: '400px',
      autoFocus: false,
      panelClass: 'logout-dialog'
    });

    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.authService.logout();
      }
    });
  }
}
