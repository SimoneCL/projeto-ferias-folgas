import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelacEquipeEditComponent } from './relac-equipe-edit.component';


describe('RelacEquipeEditComponent', () => {
  let component: RelacEquipeEditComponent;
  let fixture: ComponentFixture<RelacEquipeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelacEquipeEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelacEquipeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
