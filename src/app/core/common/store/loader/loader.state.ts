export interface LoaderState {
  activeRequests: number;
}

export const initialLoaderState: LoaderState = {
  activeRequests: 0
};
