import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorGridItemComponent } from './item.component';

describe('ItemComponent', () => {
  let component: ColorGridItemComponent;
  let fixture: ComponentFixture<ColorGridItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorGridItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorGridItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
