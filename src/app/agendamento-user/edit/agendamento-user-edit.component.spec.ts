import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendamentoUserEditComponent } from './agendamento-user-edit.component';

describe('AgendamentoUserEditComponent', () => {
  let component: AgendamentoUserEditComponent;
  let fixture: ComponentFixture<AgendamentoUserEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgendamentoUserEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendamentoUserEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
