import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroUserEditComponent } from './cadastro-user-edit.component';

describe('CadastroUserEditComponent', () => {
  let component: CadastroUserEditComponent;
  let fixture: ComponentFixture<CadastroUserEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CadastroUserEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CadastroUserEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
