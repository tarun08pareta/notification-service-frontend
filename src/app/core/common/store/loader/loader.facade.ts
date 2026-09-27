import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { loadStart, loadEnd } from './loader.actions';
import { selectIsLoading } from './loader.selectors';
import { LoaderState } from './loader.state';

@Injectable({ providedIn: 'root' })
export class LoaderFacade {
  private readonly store = inject(Store<{ loader: LoaderState }>);

  readonly isLoading$: Observable<boolean> = this.store.select(selectIsLoading);

  startLoading(): void {
    this.store.dispatch(loadStart());
  }

  stopLoading(): void {
    this.store.dispatch(loadEnd());
  }
}
