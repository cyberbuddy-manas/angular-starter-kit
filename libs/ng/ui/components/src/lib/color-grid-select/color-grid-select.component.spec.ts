import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorGridSelectComponent } from './color-grid-select.component';

describe('ColorGridSelectComponent', () => {
  let component: ColorGridSelectComponent;
  let fixture: ComponentFixture<ColorGridSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorGridSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorGridSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
