import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LoaderState } from './loader.state';

export const selectLoaderState = createFeatureSelector<LoaderState>('loader');

export const selectIsLoading = createSelector(
  selectLoaderState,
  (state: LoaderState) => state.activeRequests > 0
);
