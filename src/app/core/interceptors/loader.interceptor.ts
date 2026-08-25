import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs';
import { loadStart, loadEnd } from '../store/loader/loader.actions';

export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  const store = inject(Store);
  store.dispatch(loadStart());

  return next(req).pipe(
    finalize(() => {
      store.dispatch(loadEnd());
    })
  );
};
