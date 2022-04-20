import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localePt from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PoI18nConfig, PoI18nModule, PoModule } from '@po-ui/ng-components';
import { PoTemplatesModule } from '@po-ui/ng-templates';
import { TranslateService } from 'dts-backoffice-util';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoadingInterceptorModule } from './loading-interceptor.module';
import { generalEn } from './shared/literals/i18n/general-en';
import { generalEs } from './shared/literals/i18n/general-es';
import { generalPt } from './shared/literals/i18n/general-pt';



registerLocaleData(localePt);
registerLocaleData(localeEs);

const i18nConfig: PoI18nConfig = {
    default: {
        context: 'general',
        cache: true,
        language: 'pt-BR'
    },
    contexts: {
        general: {
            'pt-BR': generalPt,
            'en-US': generalEn,
            'es': generalEs
        }
    }
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        LoadingInterceptorModule,
        PoModule,
        PoTemplatesModule,
        CommonModule,
        FormsModule,
        AppRoutingModule,
        PoI18nModule.config(i18nConfig)
    ],
    providers: [
        { provide: LOCALE_ID, useValue: TranslateService.getCurrentLanguage() },
        { provide: DEFAULT_CURRENCY_CODE, useValue: TranslateService.getDefaultCurrencyCode() }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
