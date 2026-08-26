import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title if provided', () => {
    component.title = 'Test Title';
    fixture.detectChanges();
    const titleEl = fixture.debugElement.query(By.css('mat-card-title'));
    expect(titleEl).toBeTruthy();
    expect(titleEl.nativeElement.textContent).toContain('Test Title');
  });
});
