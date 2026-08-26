import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';

describe('ErrorStateComponent', () => {
  let component: ErrorStateComponent;
  let fixture: ComponentFixture<ErrorStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorStateComponent);
    component = fixture.componentInstance;
    component.message = 'Something failed';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.message')?.textContent).toContain('Something failed');
  });

  it('should emit retry on click', () => {
    spyOn(component.retry, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.retry.emit).toHaveBeenCalled();
  });
});
