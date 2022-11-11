import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeriadosComponent } from './feriados.component';

describe('FeriadosComponent', () => {
  let component: FeriadosComponent;
  let fixture: ComponentFixture<FeriadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeriadosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeriadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
