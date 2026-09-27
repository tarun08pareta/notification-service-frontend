import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderFacade } from '../store/loader/loader.facade';

export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_GLOBAL_LOADER)) {
    return next(req);
  }

  const loaderFacade = inject(LoaderFacade);
  loaderFacade.startLoading();

  return next(req).pipe(
    finalize(() => {
      loaderFacade.stopLoading();
    })
  );
};
