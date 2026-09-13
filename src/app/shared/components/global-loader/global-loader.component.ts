import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Store } from '@ngrx/store';
import { selectIsLoading } from '../../../core/common/store/loader/loader.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss'
})
export class GlobalLoaderComponent {
  private store = inject(Store);
  isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
}
