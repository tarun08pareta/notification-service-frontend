import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusChipComponent } from './status-chip.component';

describe('StatusChipComponent', () => {
  let component: StatusChipComponent;
  let fixture: ComponentFixture<StatusChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusChipComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusChipComponent);
    component = fixture.componentInstance;
    component.label = 'Active';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Active');
  });
});
