import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalLoaderComponent } from './global-loader.component';
import { provideStore } from '@ngrx/store';
import { loaderReducer } from '../../../core/common/store/loader/loader.reducer';

describe('GlobalLoaderComponent', () => {
  let component: GlobalLoaderComponent;
  let fixture: ComponentFixture<GlobalLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [
        provideStore({ loader: loaderReducer })
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GlobalLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
