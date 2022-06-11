import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeriasFolgaComponent } from './ferias-folga.component';

describe('FeriasFolgaComponent', () => {
  let component: FeriasFolgaComponent;
  let fixture: ComponentFixture<FeriasFolgaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeriasFolgaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeriasFolgaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
