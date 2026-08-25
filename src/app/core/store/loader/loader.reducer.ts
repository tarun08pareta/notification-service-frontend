import { createReducer, on } from '@ngrx/store';
import { initialLoaderState, LoaderState } from './loader.state';
import { loadStart, loadEnd } from './loader.actions';

export const loaderReducer = createReducer(
  initialLoaderState,
  on(loadStart, (state): LoaderState => ({
    ...state,
    activeRequests: state.activeRequests + 1
  })),
  on(loadEnd, (state): LoaderState => ({
    ...state,
    activeRequests: Math.max(0, state.activeRequests - 1)
  }))
);
