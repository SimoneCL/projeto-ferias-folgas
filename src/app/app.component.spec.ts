import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PoModule, PoI18nModule } from '@po-ui/ng-components';
import { AppModule } from './app.module';


describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        BrowserTestingModule,
        PoModule,
        PoTemplatesModule,
        CommonModule,
        FormsModule,
        PoI18nModule,
        AppModule
      ],
      providers: [ ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();

  })
  );

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app).toBeTruthy();
  });

});
