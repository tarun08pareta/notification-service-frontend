import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable } from 'rxjs';
import { LoaderFacade } from '../../../core/common/store/loader/loader.facade';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss'
})
export class GlobalLoaderComponent {
  private loaderFacade = inject(LoaderFacade);
  isLoading$: Observable<boolean> = this.loaderFacade.isLoading$;
}
