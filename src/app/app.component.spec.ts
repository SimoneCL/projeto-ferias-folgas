import { CommonModule } from '@angular/common';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { PoI18nModule, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { AppComponent } from './AppComponent';
import { AppModule } from './app.module';


describe('AppComponent', () => {

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
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

  

});
